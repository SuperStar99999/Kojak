import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Http } from '@angular/http';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/first';
import { InAppPurchase } from '@ionic-native/in-app-purchase';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  pronos: any;
  classement: any;
  classementBankroll=[];
  private JSObject: Object = Object;
  userVIP = false;


  constructor(public navCtrl: NavController, private http: Http, public modalCtrl: ModalController, private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, private iap: InAppPurchase) {

  }

  ionViewDidLoad() {
    this.http.get("http://kojakpronos.esy.es/jour.php")
      .subscribe(pronos => {
        this.pronos = pronos.json();
      });

        this.afAuth.authState
      .first().subscribe(user => {
        console.log(user);
        if (user) {
          this.verif(user.uid)
            .then(() => {
              this.userVIP = true;
            })
            .catch(() => {
              this.userVIP = false;
            });
        }
      })

      
    this.afDatabase.list("/pronostic")
                    .subscribe(paris => {
                      let cl_tmp=paris.reduce(function(res,obj){
                        if(res[obj.user]==undefined)
                          res[obj.user]={key:obj.user,benefice:parseFloat(obj.benefice),displayName:obj.detailUser.pseudo};
                        else
                          res[obj.user].benefice=res[obj.user].benefice+parseFloat(obj.benefice);
                        return res;
                      },[]);
                      cl_tmp=Object.keys(cl_tmp).map(function(k){return cl_tmp[k]});
                      this.classementBankroll=cl_tmp;

                      this.classementBankroll.sort(function (x, y) {
                        return y.benefice-x.benefice;
                      });

                    });

}

getweather(query) {
      this.http.get("https://apifootball.com/api/?action=get_standings&league_id=376&APIkey=7e54f8cc0bcd259200df4123f5fe1ceb8ca717db833afa6af3fd3248e73dfe19")
      .subscribe(classement => {
        this.classement = classement.json();
      });
  }

  doRefresh(refresher) {
    this.http.get("http://kojakpronos.esy.es/jour.php")
      .subscribe(pronos => {
        this.pronos = pronos.json();
        refresher.complete();
      });
  }

   goto(prono) {
    if (prono.vip) {
      this.afAuth.authState
        .first().subscribe(user => {
          if (!user) {
            let loginModal = this.modalCtrl.create('LoginPage');
            loginModal.present();
            loginModal.onDidDismiss(logged => {
              if (logged) {
                this.verif(user.uid)
                  .then(() => {
                    this.navCtrl.push('PronoPage', { prono: prono });
                  })
                  .catch(() => {
                    this.buy(user.uid)
                      .then(() => {
                        this.navCtrl.push('PronoPage', { prono: prono });
                      })
                      .catch(e => console.log(e));
                  })
              }
            });
          } else {
            this.verif(user.uid)
              .then(() => {
                this.navCtrl.push('PronoPage', { prono: prono });
              })
              .catch(() => {
                this.buy(user.uid)
                  .then(() => {
                    this.navCtrl.push('PronoPage', { prono: prono });
                  })
                  .catch(e => console.log(e));
              })
          }
        });
    } else {
      this.navCtrl.push('PronoPage', { prono: prono });
    }
  }

  buy(uid) {
    return new Promise((resolve, reject) => {
      this.iap.getProducts(['KOJAKVIP37'])
        .then((prod) => {
          this.iap.subscribe(prod[0].productId)
            .then((res) => {
              this.afDatabase.object("/users/" + uid + "/vip").update({ statut: true, date: new Date().toISOString() })
                .then(() => {
                  resolve();
                })
            })
            .catch(err => {
              reject(err);
            })
        });
    });
  }

  verif(uid) {
    return new Promise((resolve, reject) => {
      this.afDatabase.object("/users/" + uid + "/vip")
        .first().subscribe(vip => {
          if (vip.statut) {
            var actual = new Date();
            var date = new Date(vip.date);
            var timeDiff = Math.abs(actual.getTime() - date.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            if (diffDays > 30) {
              this.afDatabase.object("/users/" + uid + "/vip/statut").set(false)
                .then(() => {
                  reject();
                });
            } else {
              resolve();
            }
          } else {
            reject();
          }
        })
    });
  }

}