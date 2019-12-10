import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { CheckoutAdapter } from '../../../checkout/connectors/checkout/checkout.adapter';
import { ORDER_NORMALIZER } from '../../../checkout/connectors/checkout/converters';
import { CheckoutDetails } from '../../../checkout/models/checkout.model';
import { Order } from '../../../model/order.model';
import { ConverterService } from '../../../util/converter.service';
import { Occ } from '../../occ-models/occ.models';
import { OccEndpointsService } from '../../services/occ-endpoints.service';
import {
  InterceptorUtil,
  USE_CLIENT_TOKEN,
} from '../../utils/interceptor-util';
import { OCC_USER_ID_ANONYMOUS } from '../../utils/occ-constants';

// To be changed to a more optimised params after ticket: C3PO-1076
const FULL_PARAMS = 'fields=FULL';
const CHECKOUT_PARAMS = 'deliveryAddress(FULL),deliveryMode,paymentInfo(FULL)';
const ORDERS_ENDPOINT = '/orders';
const CARTS_ENDPOINT = '/carts/';

@Injectable()
export class OccCheckoutAdapter implements CheckoutAdapter {
  // ! Default number of retries for failed requests
  private RETRY_ATTEMPTS = 3;
  constructor(
    protected http: HttpClient,
    protected occEndpoints: OccEndpointsService,
    protected converter: ConverterService
  ) {}

  protected getEndpoint(userId: string, subEndpoint: string): string {
    const orderEndpoint = 'users/' + userId + subEndpoint;
    return this.occEndpoints.getEndpoint(orderEndpoint);
  }

  public placeOrder(userId: string, cartId: string): Observable<Order> {
    const url = this.getEndpoint(userId, ORDERS_ENDPOINT);
    const params = new HttpParams({
      fromString: 'cartId=' + cartId + '&' + FULL_PARAMS,
    });

    let headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    if (userId === OCC_USER_ID_ANONYMOUS) {
      headers = InterceptorUtil.createHeader(USE_CLIENT_TOKEN, true, headers);
    }

    return this.http
      .post<Occ.Order>(url, {}, { headers, params })
      .pipe(this.converter.pipeable(ORDER_NORMALIZER));
  }

  loadCheckoutDetails(
    userId: string,
    cartId: string
  ): Observable<CheckoutDetails> {
    const url = this.getEndpoint(userId, CARTS_ENDPOINT) + cartId;
    const params = new HttpParams({
      fromString: `fields=${CHECKOUT_PARAMS}`,
    });

    return this.http
      .get<CheckoutDetails>(url, { params })
      .pipe(retry(this.RETRY_ATTEMPTS));
  }

  clearCheckoutDeliveryAddress(
    userId: string,
    cartId: string
  ): Observable<any> {
    const url = `${this.getEndpoint(
      userId,
      CARTS_ENDPOINT
    )}${cartId}/addresses/delivery`;
    return this.http.delete<any>(url);
  }

  clearCheckoutDeliveryMode(userId: string, cartId: string): Observable<any> {
    const url = `${this.getEndpoint(
      userId,
      CARTS_ENDPOINT
    )}${cartId}/deliverymode`;
    return this.http.delete<any>(url);
  }
}
