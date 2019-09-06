import { async } from 'rxjs/scheduler/async';
import * as Rx from 'rxjs';
import "rxjs-compat"
// function task(state: any) {
//     console.log(state);
//     this.schedule(state + 1, 1000); // `this` references currently executing Action,
//     // which we reschedule with new state and delay
// }
// async.schedule(task, 3000, 0);


// var observable = Rx.Observable.from([10, 20, 30]);
// var subscription = observable.subscribe((x: any) => console.log(x));
// // 稍后：
// subscription.unsubscribe();  // outprint:10 20 30  说明是同步执行




// var source = Rx.Observable.interval(500);
var source = Rx.Observable.from([10, 20, 30]);
var subject = new Rx.Subject();
var multicasted = source.multicast(subject);

// 在底层使用了 `subject.subscribe({...})`:
multicasted.subscribe({
    next: (v) => console.log('observerA: ' + v)
});
/**
 * @example
 *  multicasted.connect();
 * @description  如果再这里是哟会给你concent 方法   由于这个observerable 是同步的,  observerA订阅以后已经执行到complete阶段,所以后续
 * 的observerB不会执行;
 * 同理,如果source换成了一个异步序列,那么则可以执行
 */

multicasted.subscribe({
    next: (v) => console.log('observerB: ' + v)
});

// 在底层使用了 `source.subscribe(subject)`:
multicasted.connect();




// var source = Rx.Observable.interval(500);
// var subject = new Rx.Subject();
// var multicasted = source.multicast(subject);
// var subscription1: Rx.Subscription, subscription2: Rx.Subscription, subscriptionConnect: Rx.Subscription;

// subscription1 = multicasted.subscribe({
//     next: (v) => console.log('observerA: ' + v)
// });
// // 这里我们应该调用 `connect()`，因为 `multicasted` 的第一个
// // 订阅者关心消费值
// subscriptionConnect = multicasted.connect();

// setTimeout(() => {
//     subscription2 = multicasted.subscribe({
//         next: (v) => console.log('observerB: ' + v)
//     });
// }, 600);

// setTimeout(() => {
//     subscription1.unsubscribe();
// }, 1200);

// // 这里我们应该取消共享的 Observable 执行的订阅，
// // 因为此后 `multicasted` 将不再有订阅者
// setTimeout(() => {
//     subscription2.unsubscribe();
//     subscriptionConnect.unsubscribe(); // 用于共享的 Observable 执行
// }, 2000);

