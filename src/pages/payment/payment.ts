import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Stripe } from '@ionic-native/stripe';

import { Http, Headers } from '@angular/http';
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
})
export class PaymentPage {
  cardinfo: any = {
    number: '',
    expMonth: '',
    expYear: '',
    cvc: ''
  }
 strip_key = "pk_test_XcMPYQK0DxxOzvW0EvhJvw6n";
  constructor(public navCtrl: NavController, public navParams: NavParams, public stripe: Stripe, public http: Http) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentPage');
  }
  pay() {
    this.stripe.setPublishableKey(this.strip_key);
    this.stripe.createCardToken(this.cardinfo).then((token) => {
      console.log("tokken",token);
      var data = 'stripetoken=' + token + '&amount=10';
      var headers = new Headers();
      headers.append('Conent-Type', 'application/x-www-form-urlencoded');
      this.http.post('http://192.168.3.5:3333/processpay', data, { headers: headers }).subscribe((res) => {
        if (res.json().success)
        alert('transaction Successfull!!')  
      })
    })
  }

}
