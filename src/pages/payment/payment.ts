
import { Component, ViewChild, trigger, transition, style, state, animate, keyframes } from '@angular/core';
import {  Slides } from 'ionic-angular';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Stripe } from '@ionic-native/stripe';

import { Http, Headers } from '@angular/http';
import { AngularFireDatabase } from 'angularfire2/database';
import {GlobalVar} from '../provider/globalvar';
/**
 * Generated class for the PaymentPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-payment',
  templateUrl: 'payment.html',
  animations: [

    trigger('bounce', [
      state('*', style({
        transform: 'translateX(0)'
      })),
      transition('* => rightSwipe', animate('700ms ease-out', keyframes([
        style({transform: 'translateX(0)', offset: 0}),
        style({transform: 'translateX(-65px)', offset: .3}),
        style({transform: 'translateX(0)', offset: 1})
      ]))),
      transition('* => leftSwipe', animate('700ms ease-out', keyframes([
        style({transform: 'translateX(0)', offset: 0}),
        style({transform: 'translateX(65px)', offset: .3}),
        style({transform: 'translateX(0)', offset: 1})
      ])))
    ])
  ]



})
export class PaymentPage {

    @ViewChild(Slides) slides: Slides;
  skipMsg: string = "Super! J'ai compris";
  state: string = 'x';


  cardinfo: any = {
    number: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  }
  money_amount = 10;
  strip_key = "pk_test_XcMPYQK0DxxOzvW0EvhJvw6n";
  SERVER_URL = "https://us-central1-kojak-pronos.cloudfunctions.net/api";
  userId = "";
  date = new Date().getTime();
  constructor(public navCtrl: NavController, public globalVar:GlobalVar, public navParams: NavParams, public stripe: Stripe, public http: Http, private afDatabase: AngularFireDatabase) {
    this.userId = navParams.get('userId');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }
  pay() {
 
    this.stripe.setPublishableKey(this.strip_key);
    this.stripe.createCardToken(this.cardinfo).then((token) => {

      var data = { stripetoken: token, amount: this.money_amount };
      var headers = new Headers();
      headers.append('Conent-Type', 'application/x-www-form-urlencoded');
      this.http.post(this.SERVER_URL + "/processpay", data, { headers: headers }).subscribe((res) => {
        let body = res['_body'];
        let jBody = JSON.parse(body)
        if (jBody.success == true) {
          this.globalVar.isVip = true;
          console.log(this.date);
          alert('Bienvenue dans le VIP!')
          this.navCtrl.pop();          
          this.setVip();
        } else {
          console.log(res);
          alert('Le paiement a été refusé, vérifiez vos informations')
        }
      })
    })
  }
  
  setVip() {
    this.afDatabase.object("/users/" + this.globalVar.userUid).subscribe(userdata => {
      var vipdata = userdata;
      vipdata.vip = true;      
      vipdata.date = this.date;
      this.afDatabase.object('users/' + this.globalVar.userUid).set(vipdata)
        .then(() => {
        });
      console.log(vipdata)
    });
  }


  slideChanged() {
    if (this.slides.isEnd())
      this.skipMsg = "Super! J'ai compris";
  }

  slideMoved() {
    if (this.slides.getActiveIndex() >= this.slides.getPreviousIndex())
      this.state = 'rightSwipe';
    else
      this.state = 'leftSwipe';
  }

  animationDone() {
    this.state = 'x';
  }










openHomePage(){
    this.navCtrl.popToRoot();   
  }








  

}
