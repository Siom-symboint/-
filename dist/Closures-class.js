var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var toStringChange = function () {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i] = arguments[_i];
    }
    return function (target, key, description) {
        console.log(target, key, description);
        arg.forEach(function (item) {
            if (target[item]) {
                target[item].toString = function () {
                    return target.result;
                };
            }
        });
    };
};
var add = 1;
var Mat = /** @class */ (function () {
    function Mat() {
    }
    Mat.prototype.add = function (s) {
        var result = 0;
        return function (y) {
            console.log(this);
            return this.add;
        };
    };
    ;
    __decorate([
        toStringChange('add')
    ], Mat.prototype, "add", null);
    return Mat;
}());
console.log(new Mat().add(1));
//# sourceMappingURL=Closures-class.js.map