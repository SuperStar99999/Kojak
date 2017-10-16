import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ModalController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions } from '@ionic-native/push';

import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import 'rxjs/add/operator/first';

import { HomePage } from '../pages/home/home';
import { PaymentPage } from '../pages/payment/payment';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  tabBarElement: any;
  splash = true;
  pseudo: any;

  pages: Array<{ title: string, component: any, icon: any }>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, public push: Push, public alertCtrl: AlertController, private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase, public modalCtrl: ModalController) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Pronos', component: HomePage, icon: 'md-pricetags' },
      { title: 'Bankroll', component: 'BankrollPage', icon: 'md-pricetags' },
      { title: 'Bankroll Concours', component: 'BankrollConcoursPage', icon: 'md-pricetags' },
      { title: 'Guide du Parieur', component: 'GuidePage', icon: 'md-bookmarks' },
      { title: 'Messagerie', component: 'ContactPage', icon: 'md-mail' },
      { title: 'Chatroom', component: 'ChatPage', icon: 'md-mail' },


    ];


    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.pushsetup();
    });


    this.tabBarElement = document.querySelector('.tabbar');



  }



  pushsetup() {
    const options: PushOptions = {
      android: {
        senderID: '509801286196'
      },
      ios: {
        alert: 'true',
        badge: true,
        sound: 'false'
      },
      windows: {}
    };

    const pushObject: PushObject = this.push.init(options);

    pushObject.on('notification').subscribe((notification: any) => {
      if (notification.additionalData.foreground) {
        let youralert = this.alertCtrl.create({
          title: 'New Push notification',
          message: notification.message
        });
        youralert.present();
      }
    });

    pushObject.on('registration').subscribe((registration: any) => {
      //do whatever you want with the registration ID
    });

    pushObject.on('error').subscribe(error => alert('Error with Push plugin' + error));
  }







  initializeApp() {
    this.tabBarElement = 'none';
    setTimeout(() => {
      this.splash = false;
      this.tabBarElement = 'flex';
    }, 2000);

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
    this.afAuth.authState
      .subscribe(user => {
        if (user) {
          this.afDatabase.object('users/' + user.uid)
            .first().subscribe(user => {
              this.pseudo = user.pseudo;
              if (this.pseudo == "kojak" || this.pseudo == "KOJAK") {
                this.pages.push({ title: 'Administration', component: 'AdministrationPage', icon: 'md-clipboard' });
              }
            });
        } else {
          this.pseudo = null;
        }
      });
  }

  logout() {
    this.afAuth.auth.signOut();
    this.nav.setRoot(HomePage);
  }

  openPage(page) {
    if (page.title == 'Bankroll' || page.title == 'Bankroll concours') {
      if (!this.pseudo) {
        let loginModal = this.modalCtrl.create('LoginPage');
        loginModal.present();
        loginModal.onDidDismiss(logged => {
          if (logged) {
            console.log("PersionalData", logged.uid);
            this.afDatabase.object("/users/" + logged.uid).subscribe(paris => {
              if (paris.vip) {
                if (paris.startdate) {
                  this.nav.push(PaymentPage);
                }
                else {
                  this.nav.push(PaymentPage);
                }
              } else {
                this.nav.push(PaymentPage);
              }
            });
          }
        });
      } else {
        this.nav.setRoot(page.component);
      }
    } else {
      this.nav.setRoot(page.component);
    }
  }
}
