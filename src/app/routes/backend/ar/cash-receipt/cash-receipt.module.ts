import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CashReceiptRoutingModule } from './cash-receipt-routing.module';
import { CashReceiptComponent } from './cash-receipt.component';


@NgModule({
  declarations: [CashReceiptComponent],
  imports: [
    CommonModule,
    CashReceiptRoutingModule
  ]
})
export class CashReceiptModule { }
