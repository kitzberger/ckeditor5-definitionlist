import { ObservableMixin as X, Collection as Ie, CKEditorError as w, EmitterMixin as st, isNode as Fe, toArray as Y, DomEmitterMixin as at, isIterable as ie, uid as ct, env as lt, delay as dt, getEnvKeystrokeText as re } from "@ckeditor/ckeditor5-utils";
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class ut extends X() {
  /**
   * @inheritDoc
   */
  constructor(t) {
    super(), this._disableStack = /* @__PURE__ */ new Set(), this.editor = t, this.set("isEnabled", !0);
  }
  /**
   * Disables the plugin.
   *
   * Plugin may be disabled by multiple features or algorithms (at once). When disabling a plugin, unique id should be passed
   * (e.g. feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the plugin.
   * The plugin becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
   *
   * Disabling and enabling a plugin:
   *
   * ```ts
   * plugin.isEnabled; // -> true
   * plugin.forceDisabled( 'MyFeature' );
   * plugin.isEnabled; // -> false
   * plugin.clearForceDisabled( 'MyFeature' );
   * plugin.isEnabled; // -> true
   * ```
   *
   * Plugin disabled by multiple features:
   *
   * ```ts
   * plugin.forceDisabled( 'MyFeature' );
   * plugin.forceDisabled( 'OtherFeature' );
   * plugin.clearForceDisabled( 'MyFeature' );
   * plugin.isEnabled; // -> false
   * plugin.clearForceDisabled( 'OtherFeature' );
   * plugin.isEnabled; // -> true
   * ```
   *
   * Multiple disabling with the same identifier is redundant:
   *
   * ```ts
   * plugin.forceDisabled( 'MyFeature' );
   * plugin.forceDisabled( 'MyFeature' );
   * plugin.clearForceDisabled( 'MyFeature' );
   * plugin.isEnabled; // -> true
   * ```
   *
   * **Note:** some plugins or algorithms may have more complex logic when it comes to enabling or disabling certain plugins,
   * so the plugin might be still disabled after {@link #clearForceDisabled} was used.
   *
   * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the plugin.
   */
  forceDisabled(t) {
    this._disableStack.add(t), this._disableStack.size == 1 && (this.on("set:isEnabled", oe, { priority: "highest" }), this.isEnabled = !1);
  }
  /**
   * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
   *
   * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
   */
  clearForceDisabled(t) {
    this._disableStack.delete(t), this._disableStack.size == 0 && (this.off("set:isEnabled", oe), this.isEnabled = !0);
  }
  /**
   * @inheritDoc
   */
  destroy() {
    this.stopListening();
  }
  /**
   * @inheritDoc
   */
  static get isContextPlugin() {
    return !1;
  }
}
function oe(e) {
  e.return = !1, e.stop();
}
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class Ve extends X() {
  /**
   * Creates a new `Command` instance.
   *
   * @param editor The editor on which this command will be used.
   */
  constructor(t) {
    super(), this.editor = t, this.set("value", void 0), this.set("isEnabled", !1), this._affectsData = !0, this._isEnabledBasedOnSelection = !0, this._disableStack = /* @__PURE__ */ new Set(), this.decorate("execute"), this.listenTo(this.editor.model.document, "change", () => {
      this.refresh();
    }), this.listenTo(t, "change:isReadOnly", () => {
      this.refresh();
    }), this.on("set:isEnabled", (n) => {
      if (!this.affectsData)
        return;
      const i = t.model.document.selection, o = !(i.getFirstPosition().root.rootName == "$graveyard") && t.model.canEditAt(i);
      (t.isReadOnly || this._isEnabledBasedOnSelection && !o) && (n.return = !1, n.stop());
    }, { priority: "highest" }), this.on("execute", (n) => {
      this.isEnabled || n.stop();
    }, { priority: "high" });
  }
  /**
   * A flag indicating whether a command execution changes the editor data or not.
   *
   * Commands with `affectsData` set to `false` will not be automatically disabled in
   * the {@link module:core/editor/editor~Editor#isReadOnly read-only mode} and
   * {@glink features/read-only#related-features other editor modes} with restricted user write permissions.
   *
   * **Note:** You do not have to set it for your every command. It is `true` by default.
   *
   * @default true
   */
  get affectsData() {
    return this._affectsData;
  }
  set affectsData(t) {
    this._affectsData = t;
  }
  /**
   * Refreshes the command. The command should update its {@link #isEnabled} and {@link #value} properties
   * in this method.
   *
   * This method is automatically called when
   * {@link module:engine/model/document~Document#event:change any changes are applied to the document}.
   */
  refresh() {
    this.isEnabled = !0;
  }
  /**
   * Disables the command.
   *
   * Command may be disabled by multiple features or algorithms (at once). When disabling a command, unique id should be passed
   * (e.g. the feature name). The same identifier should be used when {@link #clearForceDisabled enabling back} the command.
   * The command becomes enabled only after all features {@link #clearForceDisabled enabled it back}.
   *
   * Disabling and enabling a command:
   *
   * ```ts
   * command.isEnabled; // -> true
   * command.forceDisabled( 'MyFeature' );
   * command.isEnabled; // -> false
   * command.clearForceDisabled( 'MyFeature' );
   * command.isEnabled; // -> true
   * ```
   *
   * Command disabled by multiple features:
   *
   * ```ts
   * command.forceDisabled( 'MyFeature' );
   * command.forceDisabled( 'OtherFeature' );
   * command.clearForceDisabled( 'MyFeature' );
   * command.isEnabled; // -> false
   * command.clearForceDisabled( 'OtherFeature' );
   * command.isEnabled; // -> true
   * ```
   *
   * Multiple disabling with the same identifier is redundant:
   *
   * ```ts
   * command.forceDisabled( 'MyFeature' );
   * command.forceDisabled( 'MyFeature' );
   * command.clearForceDisabled( 'MyFeature' );
   * command.isEnabled; // -> true
   * ```
   *
   * **Note:** some commands or algorithms may have more complex logic when it comes to enabling or disabling certain commands,
   * so the command might be still disabled after {@link #clearForceDisabled} was used.
   *
   * @param id Unique identifier for disabling. Use the same id when {@link #clearForceDisabled enabling back} the command.
   */
  forceDisabled(t) {
    this._disableStack.add(t), this._disableStack.size == 1 && (this.on("set:isEnabled", se, { priority: "highest" }), this.isEnabled = !1);
  }
  /**
   * Clears forced disable previously set through {@link #forceDisabled}. See {@link #forceDisabled}.
   *
   * @param id Unique identifier, equal to the one passed in {@link #forceDisabled} call.
   */
  clearForceDisabled(t) {
    this._disableStack.delete(t), this._disableStack.size == 0 && (this.off("set:isEnabled", se), this.refresh());
  }
  /**
   * Executes the command.
   *
   * A command may accept parameters. They will be passed from {@link module:core/editor/editor~Editor#execute `editor.execute()`}
   * to the command.
   *
   * The `execute()` method will automatically abort when the command is disabled ({@link #isEnabled} is `false`).
   * This behavior is implemented by a high priority listener to the {@link #event:execute} event.
   *
   * In order to see how to disable a command from "outside" see the {@link #isEnabled} documentation.
   *
   * This method may return a value, which would be forwarded all the way down to the
   * {@link module:core/editor/editor~Editor#execute `editor.execute()`}.
   *
   * @fires execute
   */
  execute(...t) {
  }
  /**
   * Destroys the command.
   */
  destroy() {
    this.stopListening();
  }
}
function se(e) {
  e.return = !1, e.stop();
}
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class Ne extends Ie {
  /**
   * Creates a new instance of the {@link module:ui/viewcollection~ViewCollection}.
   *
   * @param initialItems The initial items of the collection.
   */
  constructor(t = []) {
    super(t, {
      // An #id Number attribute should be legal and not break the `ViewCollection` instance.
      // https://github.com/ckeditor/ckeditor5-ui/issues/93
      idProperty: "viewUid"
    }), this.on("add", (n, i, r) => {
      this._renderViewIntoCollectionParent(i, r);
    }), this.on("remove", (n, i) => {
      i.element && this._parentElement && i.element.remove();
    }), this._parentElement = null;
  }
  /**
   * Destroys the view collection along with child views.
   * See the view {@link module:ui/view~View#destroy} method.
   */
  destroy() {
    this.map((t) => t.destroy());
  }
  /**
   * Sets the parent HTML element of this collection. When parent is set, {@link #add adding} and
   * {@link #remove removing} views in the collection synchronizes their
   * {@link module:ui/view~View#element elements} in the parent element.
   *
   * @param element A new parent element.
   */
  setParent(t) {
    this._parentElement = t;
    for (const n of this)
      this._renderViewIntoCollectionParent(n);
  }
  /**
   * Delegates selected events coming from within views in the collection to any
   * {@link module:utils/emittermixin~Emitter}.
   *
   * For the following views and collection:
   *
   * ```ts
   * const viewA = new View();
   * const viewB = new View();
   * const viewC = new View();
   *
   * const views = parentView.createCollection();
   *
   * views.delegate( 'eventX' ).to( viewB );
   * views.delegate( 'eventX', 'eventY' ).to( viewC );
   *
   * views.add( viewA );
   * ```
   *
   * the `eventX` is delegated (fired by) `viewB` and `viewC` along with `customData`:
   *
   * ```ts
   * viewA.fire( 'eventX', customData );
   * ```
   *
   * and `eventY` is delegated (fired by) `viewC` along with `customData`:
   *
   * ```ts
   * viewA.fire( 'eventY', customData );
   * ```
   *
   * See {@link module:utils/emittermixin~Emitter#delegate}.
   *
   * @param events {@link module:ui/view~View} event names to be delegated to another
   * {@link module:utils/emittermixin~Emitter}.
   * @returns Object with `to` property, a function which accepts the destination
   * of {@link module:utils/emittermixin~Emitter#delegate delegated} events.
   */
  delegate(...t) {
    if (!t.length || !ft(t))
      throw new w("ui-viewcollection-delegate-wrong-events", this);
    return {
      to: (n) => {
        for (const i of this)
          for (const r of t)
            i.delegate(r).to(n);
        this.on("add", (i, r) => {
          for (const o of t)
            r.delegate(o).to(n);
        }), this.on("remove", (i, r) => {
          for (const o of t)
            r.stopDelegating(o, n);
        });
      }
    };
  }
  /**
   * This method {@link module:ui/view~View#render renders} a new view added to the collection.
   *
   * If the {@link #_parentElement parent element} of the collection is set, this method also adds
   * the view's {@link module:ui/view~View#element} as a child of the parent in DOM at a specified index.
   *
   * **Note**: If index is not specified, the view's element is pushed as the last child
   * of the parent element.
   *
   * @param view A new view added to the collection.
   * @param index An index the view holds in the collection. When not specified,
   * the view is added at the end.
   */
  _renderViewIntoCollectionParent(t, n) {
    t.isRendered || t.render(), t.element && this._parentElement && this._parentElement.insertBefore(t.element, this._parentElement.children[n]);
  }
  /**
   * Removes a child view from the collection. If the {@link #setParent parent element} of the
   * collection has been set, the {@link module:ui/view~View#element element} of the view is also removed
   * in DOM, reflecting the order of the collection.
   *
   * See the {@link #add} method.
   *
   * @param subject The view to remove, its id or index in the collection.
   * @returns The removed view.
   */
  remove(t) {
    return super.remove(t);
  }
}
function ft(e) {
  return e.every((t) => typeof t == "string");
}
var Be = typeof global == "object" && global && global.Object === Object && global, ht = typeof self == "object" && self && self.Object === Object && self, f = Be || ht || Function("return this")(), T = f.Symbol, Me = Object.prototype, pt = Me.hasOwnProperty, bt = Me.toString, C = T ? T.toStringTag : void 0;
function gt(e) {
  var t = pt.call(e, C), n = e[C];
  try {
    e[C] = void 0;
    var i = !0;
  } catch {
  }
  var r = bt.call(e);
  return i && (t ? e[C] = n : delete e[C]), r;
}
var mt = Object.prototype, yt = mt.toString;
function vt(e) {
  return yt.call(e);
}
var _t = "[object Null]", wt = "[object Undefined]", ae = T ? T.toStringTag : void 0;
function P(e) {
  return e == null ? e === void 0 ? wt : _t : ae && ae in Object(e) ? gt(e) : vt(e);
}
function L(e) {
  return e != null && typeof e == "object";
}
var J = Array.isArray;
function I(e) {
  var t = typeof e;
  return e != null && (t == "object" || t == "function");
}
var Tt = "[object AsyncFunction]", xt = "[object Function]", jt = "[object GeneratorFunction]", $t = "[object Proxy]";
function Ue(e) {
  if (!I(e))
    return !1;
  var t = P(e);
  return t == xt || t == jt || t == Tt || t == $t;
}
var z = f["__core-js_shared__"], ce = function() {
  var e = /[^.]+$/.exec(z && z.keys && z.keys.IE_PROTO || "");
  return e ? "Symbol(src)_1." + e : "";
}();
function At(e) {
  return !!ce && ce in e;
}
var Ct = Function.prototype, Et = Ct.toString;
function y(e) {
  if (e != null) {
    try {
      return Et.call(e);
    } catch {
    }
    try {
      return e + "";
    } catch {
    }
  }
  return "";
}
var Dt = /[\\^$.*+?()[\]{}|]/g, St = /^\[object .+?Constructor\]$/, Ot = Function.prototype, kt = Object.prototype, Pt = Ot.toString, Lt = kt.hasOwnProperty, It = RegExp(
  "^" + Pt.call(Lt).replace(Dt, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function Ft(e) {
  if (!I(e) || At(e))
    return !1;
  var t = Ue(e) ? It : St;
  return t.test(y(e));
}
function Vt(e, t) {
  return e == null ? void 0 : e[t];
}
function v(e, t) {
  var n = Vt(e, t);
  return Ft(n) ? n : void 0;
}
var K = v(f, "WeakMap"), le = Object.create, Nt = /* @__PURE__ */ function() {
  function e() {
  }
  return function(t) {
    if (!I(t))
      return {};
    if (le)
      return le(t);
    e.prototype = t;
    var n = new e();
    return e.prototype = void 0, n;
  };
}(), de = function() {
  try {
    var e = v(Object, "defineProperty");
    return e({}, "", {}), e;
  } catch {
  }
}();
function Bt(e, t) {
  for (var n = -1, i = e == null ? 0 : e.length; ++n < i && t(e[n], n, e) !== !1; )
    ;
  return e;
}
var Mt = 9007199254740991, Ut = /^(?:0|[1-9]\d*)$/;
function Rt(e, t) {
  var n = typeof e;
  return t = t ?? Mt, !!t && (n == "number" || n != "symbol" && Ut.test(e)) && e > -1 && e % 1 == 0 && e < t;
}
function zt(e, t, n) {
  t == "__proto__" && de ? de(e, t, {
    configurable: !0,
    enumerable: !0,
    value: n,
    writable: !0
  }) : e[t] = n;
}
function Re(e, t) {
  return e === t || e !== e && t !== t;
}
var Gt = Object.prototype, Kt = Gt.hasOwnProperty;
function Ht(e, t, n) {
  var i = e[t];
  (!(Kt.call(e, t) && Re(i, n)) || n === void 0 && !(t in e)) && zt(e, t, n);
}
var Wt = 9007199254740991;
function ze(e) {
  return typeof e == "number" && e > -1 && e % 1 == 0 && e <= Wt;
}
function qt(e) {
  return e != null && ze(e.length) && !Ue(e);
}
var Xt = Object.prototype;
function Ge(e) {
  var t = e && e.constructor, n = typeof t == "function" && t.prototype || Xt;
  return e === n;
}
function Yt(e, t) {
  for (var n = -1, i = Array(e); ++n < e; )
    i[n] = t(n);
  return i;
}
var Jt = "[object Arguments]";
function ue(e) {
  return L(e) && P(e) == Jt;
}
var Ke = Object.prototype, Zt = Ke.hasOwnProperty, Qt = Ke.propertyIsEnumerable, en = ue(/* @__PURE__ */ function() {
  return arguments;
}()) ? ue : function(e) {
  return L(e) && Zt.call(e, "callee") && !Qt.call(e, "callee");
};
function tn() {
  return !1;
}
var He = typeof exports == "object" && exports && !exports.nodeType && exports, fe = He && typeof module == "object" && module && !module.nodeType && module, nn = fe && fe.exports === He, he = nn ? f.Buffer : void 0, rn = he ? he.isBuffer : void 0, We = rn || tn, on = "[object Arguments]", sn = "[object Array]", an = "[object Boolean]", cn = "[object Date]", ln = "[object Error]", dn = "[object Function]", un = "[object Map]", fn = "[object Number]", hn = "[object Object]", pn = "[object RegExp]", bn = "[object Set]", gn = "[object String]", mn = "[object WeakMap]", yn = "[object ArrayBuffer]", vn = "[object DataView]", _n = "[object Float32Array]", wn = "[object Float64Array]", Tn = "[object Int8Array]", xn = "[object Int16Array]", jn = "[object Int32Array]", $n = "[object Uint8Array]", An = "[object Uint8ClampedArray]", Cn = "[object Uint16Array]", En = "[object Uint32Array]", l = {};
l[_n] = l[wn] = l[Tn] = l[xn] = l[jn] = l[$n] = l[An] = l[Cn] = l[En] = !0;
l[on] = l[sn] = l[yn] = l[an] = l[vn] = l[cn] = l[ln] = l[dn] = l[un] = l[fn] = l[hn] = l[pn] = l[bn] = l[gn] = l[mn] = !1;
function Dn(e) {
  return L(e) && ze(e.length) && !!l[P(e)];
}
function Z(e) {
  return function(t) {
    return e(t);
  };
}
var qe = typeof exports == "object" && exports && !exports.nodeType && exports, E = qe && typeof module == "object" && module && !module.nodeType && module, Sn = E && E.exports === qe, G = Sn && Be.process, x = function() {
  try {
    var e = E && E.require && E.require("util").types;
    return e || G && G.binding && G.binding("util");
  } catch {
  }
}(), pe = x && x.isTypedArray, On = pe ? Z(pe) : Dn, kn = Object.prototype, Pn = kn.hasOwnProperty;
function Ln(e, t) {
  var n = J(e), i = !n && en(e), r = !n && !i && We(e), o = !n && !i && !r && On(e), s = n || i || r || o, u = s ? Yt(e.length, String) : [], c = u.length;
  for (var d in e)
    Pn.call(e, d) && !(s && // Safari 9 has enumerable `arguments.length` in strict mode.
    (d == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    r && (d == "offset" || d == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    o && (d == "buffer" || d == "byteLength" || d == "byteOffset") || // Skip index properties.
    Rt(d, c))) && u.push(d);
  return u;
}
function Xe(e, t) {
  return function(n) {
    return e(t(n));
  };
}
var In = Xe(Object.keys, Object), Fn = Object.prototype, Vn = Fn.hasOwnProperty;
function Nn(e) {
  if (!Ge(e))
    return In(e);
  var t = [];
  for (var n in Object(e))
    Vn.call(e, n) && n != "constructor" && t.push(n);
  return t;
}
function Bn(e) {
  return qt(e) ? Ln(e) : Nn(e);
}
var O = v(Object, "create");
function Mn() {
  this.__data__ = O ? O(null) : {}, this.size = 0;
}
function Un(e) {
  var t = this.has(e) && delete this.__data__[e];
  return this.size -= t ? 1 : 0, t;
}
var Rn = "__lodash_hash_undefined__", zn = Object.prototype, Gn = zn.hasOwnProperty;
function Kn(e) {
  var t = this.__data__;
  if (O) {
    var n = t[e];
    return n === Rn ? void 0 : n;
  }
  return Gn.call(t, e) ? t[e] : void 0;
}
var Hn = Object.prototype, Wn = Hn.hasOwnProperty;
function qn(e) {
  var t = this.__data__;
  return O ? t[e] !== void 0 : Wn.call(t, e);
}
var Xn = "__lodash_hash_undefined__";
function Yn(e, t) {
  var n = this.__data__;
  return this.size += this.has(e) ? 0 : 1, n[e] = O && t === void 0 ? Xn : t, this;
}
function m(e) {
  var t = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++t < n; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
m.prototype.clear = Mn;
m.prototype.delete = Un;
m.prototype.get = Kn;
m.prototype.has = qn;
m.prototype.set = Yn;
function Jn() {
  this.__data__ = [], this.size = 0;
}
function M(e, t) {
  for (var n = e.length; n--; )
    if (Re(e[n][0], t))
      return n;
  return -1;
}
var Zn = Array.prototype, Qn = Zn.splice;
function ei(e) {
  var t = this.__data__, n = M(t, e);
  if (n < 0)
    return !1;
  var i = t.length - 1;
  return n == i ? t.pop() : Qn.call(t, n, 1), --this.size, !0;
}
function ti(e) {
  var t = this.__data__, n = M(t, e);
  return n < 0 ? void 0 : t[n][1];
}
function ni(e) {
  return M(this.__data__, e) > -1;
}
function ii(e, t) {
  var n = this.__data__, i = M(n, e);
  return i < 0 ? (++this.size, n.push([e, t])) : n[i][1] = t, this;
}
function p(e) {
  var t = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++t < n; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
p.prototype.clear = Jn;
p.prototype.delete = ei;
p.prototype.get = ti;
p.prototype.has = ni;
p.prototype.set = ii;
var k = v(f, "Map");
function ri() {
  this.size = 0, this.__data__ = {
    hash: new m(),
    map: new (k || p)(),
    string: new m()
  };
}
function oi(e) {
  var t = typeof e;
  return t == "string" || t == "number" || t == "symbol" || t == "boolean" ? e !== "__proto__" : e === null;
}
function U(e, t) {
  var n = e.__data__;
  return oi(t) ? n[typeof t == "string" ? "string" : "hash"] : n.map;
}
function si(e) {
  var t = U(this, e).delete(e);
  return this.size -= t ? 1 : 0, t;
}
function ai(e) {
  return U(this, e).get(e);
}
function ci(e) {
  return U(this, e).has(e);
}
function li(e, t) {
  var n = U(this, e), i = n.size;
  return n.set(e, t), this.size += n.size == i ? 0 : 1, this;
}
function $(e) {
  var t = -1, n = e == null ? 0 : e.length;
  for (this.clear(); ++t < n; ) {
    var i = e[t];
    this.set(i[0], i[1]);
  }
}
$.prototype.clear = ri;
$.prototype.delete = si;
$.prototype.get = ai;
$.prototype.has = ci;
$.prototype.set = li;
function di(e, t) {
  for (var n = -1, i = t.length, r = e.length; ++n < i; )
    e[r + n] = t[n];
  return e;
}
var ui = Xe(Object.getPrototypeOf, Object);
function fi() {
  this.__data__ = new p(), this.size = 0;
}
function hi(e) {
  var t = this.__data__, n = t.delete(e);
  return this.size = t.size, n;
}
function pi(e) {
  return this.__data__.get(e);
}
function bi(e) {
  return this.__data__.has(e);
}
var gi = 200;
function mi(e, t) {
  var n = this.__data__;
  if (n instanceof p) {
    var i = n.__data__;
    if (!k || i.length < gi - 1)
      return i.push([e, t]), this.size = ++n.size, this;
    n = this.__data__ = new $(i);
  }
  return n.set(e, t), this.size = n.size, this;
}
function A(e) {
  var t = this.__data__ = new p(e);
  this.size = t.size;
}
A.prototype.clear = fi;
A.prototype.delete = hi;
A.prototype.get = pi;
A.prototype.has = bi;
A.prototype.set = mi;
var Ye = typeof exports == "object" && exports && !exports.nodeType && exports, be = Ye && typeof module == "object" && module && !module.nodeType && module, yi = be && be.exports === Ye, ge = yi ? f.Buffer : void 0;
ge && ge.allocUnsafe;
function vi(e, t) {
  return e.slice();
}
function _i(e, t) {
  for (var n = -1, i = e == null ? 0 : e.length, r = 0, o = []; ++n < i; ) {
    var s = e[n];
    t(s, n, e) && (o[r++] = s);
  }
  return o;
}
function wi() {
  return [];
}
var Ti = Object.prototype, xi = Ti.propertyIsEnumerable, me = Object.getOwnPropertySymbols, ji = me ? function(e) {
  return e == null ? [] : (e = Object(e), _i(me(e), function(t) {
    return xi.call(e, t);
  }));
} : wi;
function $i(e, t, n) {
  var i = t(e);
  return J(e) ? i : di(i, n(e));
}
function Ai(e) {
  return $i(e, Bn, ji);
}
var H = v(f, "DataView"), W = v(f, "Promise"), q = v(f, "Set"), ye = "[object Map]", Ci = "[object Object]", ve = "[object Promise]", _e = "[object Set]", we = "[object WeakMap]", Te = "[object DataView]", Ei = y(H), Di = y(k), Si = y(W), Oi = y(q), ki = y(K), h = P;
(H && h(new H(new ArrayBuffer(1))) != Te || k && h(new k()) != ye || W && h(W.resolve()) != ve || q && h(new q()) != _e || K && h(new K()) != we) && (h = function(e) {
  var t = P(e), n = t == Ci ? e.constructor : void 0, i = n ? y(n) : "";
  if (i)
    switch (i) {
      case Ei:
        return Te;
      case Di:
        return ye;
      case Si:
        return ve;
      case Oi:
        return _e;
      case ki:
        return we;
    }
  return t;
});
var Pi = Object.prototype, Li = Pi.hasOwnProperty;
function Ii(e) {
  var t = e.length, n = new e.constructor(t);
  return t && typeof e[0] == "string" && Li.call(e, "index") && (n.index = e.index, n.input = e.input), n;
}
var xe = f.Uint8Array;
function Q(e) {
  var t = new e.constructor(e.byteLength);
  return new xe(t).set(new xe(e)), t;
}
function Fi(e, t) {
  var n = Q(e.buffer);
  return new e.constructor(n, e.byteOffset, e.byteLength);
}
var Vi = /\w*$/;
function Ni(e) {
  var t = new e.constructor(e.source, Vi.exec(e));
  return t.lastIndex = e.lastIndex, t;
}
var je = T ? T.prototype : void 0, $e = je ? je.valueOf : void 0;
function Bi(e) {
  return $e ? Object($e.call(e)) : {};
}
function Mi(e, t) {
  var n = Q(e.buffer);
  return new e.constructor(n, e.byteOffset, e.length);
}
var Ui = "[object Boolean]", Ri = "[object Date]", zi = "[object Map]", Gi = "[object Number]", Ki = "[object RegExp]", Hi = "[object Set]", Wi = "[object String]", qi = "[object Symbol]", Xi = "[object ArrayBuffer]", Yi = "[object DataView]", Ji = "[object Float32Array]", Zi = "[object Float64Array]", Qi = "[object Int8Array]", er = "[object Int16Array]", tr = "[object Int32Array]", nr = "[object Uint8Array]", ir = "[object Uint8ClampedArray]", rr = "[object Uint16Array]", or = "[object Uint32Array]";
function sr(e, t, n) {
  var i = e.constructor;
  switch (t) {
    case Xi:
      return Q(e);
    case Ui:
    case Ri:
      return new i(+e);
    case Yi:
      return Fi(e);
    case Ji:
    case Zi:
    case Qi:
    case er:
    case tr:
    case nr:
    case ir:
    case rr:
    case or:
      return Mi(e);
    case zi:
      return new i();
    case Gi:
    case Wi:
      return new i(e);
    case Ki:
      return Ni(e);
    case Hi:
      return new i();
    case qi:
      return Bi(e);
  }
}
function ar(e) {
  return typeof e.constructor == "function" && !Ge(e) ? Nt(ui(e)) : {};
}
var cr = "[object Map]";
function lr(e) {
  return L(e) && h(e) == cr;
}
var Ae = x && x.isMap, dr = Ae ? Z(Ae) : lr, ur = "[object Set]";
function fr(e) {
  return L(e) && h(e) == ur;
}
var Ce = x && x.isSet, hr = Ce ? Z(Ce) : fr, Je = "[object Arguments]", pr = "[object Array]", br = "[object Boolean]", gr = "[object Date]", mr = "[object Error]", Ze = "[object Function]", yr = "[object GeneratorFunction]", vr = "[object Map]", _r = "[object Number]", Qe = "[object Object]", wr = "[object RegExp]", Tr = "[object Set]", xr = "[object String]", jr = "[object Symbol]", $r = "[object WeakMap]", Ar = "[object ArrayBuffer]", Cr = "[object DataView]", Er = "[object Float32Array]", Dr = "[object Float64Array]", Sr = "[object Int8Array]", Or = "[object Int16Array]", kr = "[object Int32Array]", Pr = "[object Uint8Array]", Lr = "[object Uint8ClampedArray]", Ir = "[object Uint16Array]", Fr = "[object Uint32Array]", a = {};
a[Je] = a[pr] = a[Ar] = a[Cr] = a[br] = a[gr] = a[Er] = a[Dr] = a[Sr] = a[Or] = a[kr] = a[vr] = a[_r] = a[Qe] = a[wr] = a[Tr] = a[xr] = a[jr] = a[Pr] = a[Lr] = a[Ir] = a[Fr] = !0;
a[mr] = a[Ze] = a[$r] = !1;
function V(e, t, n, i, r, o) {
  var s;
  if (n && (s = r ? n(e, i, r, o) : n(e)), s !== void 0)
    return s;
  if (!I(e))
    return e;
  var u = J(e);
  if (u)
    s = Ii(e);
  else {
    var c = h(e), d = c == Ze || c == yr;
    if (We(e))
      return vi(e);
    if (c == Qe || c == Je || d && !r)
      s = d ? {} : ar(e);
    else {
      if (!a[c])
        return r ? e : {};
      s = sr(e, c);
    }
  }
  o || (o = new A());
  var _ = o.get(e);
  if (_)
    return _;
  o.set(e, s), hr(e) ? e.forEach(function(b) {
    s.add(V(b, t, n, b, e, o));
  }) : dr(e) && e.forEach(function(b, g) {
    s.set(g, V(b, t, n, g, e, o));
  });
  var ot = Ai, ne = u ? void 0 : ot(e);
  return Bt(ne || e, function(b, g) {
    ne && (g = b, b = e[g]), Ht(s, g, V(b, t, n, g, e, o));
  }), s;
}
var Vr = 1, Nr = 4;
function Br(e, t) {
  return t = typeof t == "function" ? t : void 0, V(e, Vr | Nr, t);
}
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
const Mr = "http://www.w3.org/1999/xhtml";
class D extends st() {
  /**
   * Creates an instance of the {@link ~Template} class.
   *
   * @param def The definition of the template.
   */
  constructor(t) {
    super(), Object.assign(this, De(Ee(t))), this._isRendered = !1, this._revertData = null;
  }
  /**
   * Renders a DOM Node (an HTML element or text) out of the template.
   *
   * ```ts
   * const domNode = new Template( { ... } ).render();
   * ```
   *
   * See: {@link #apply}.
   */
  render() {
    const t = this._renderNode({
      intoFragment: !0
    });
    return this._isRendered = !0, t;
  }
  /**
   * Applies the template to an existing DOM Node, either HTML element or text.
   *
   * **Note:** No new DOM nodes will be created. Applying extends:
   *
   * {@link module:ui/template~TemplateDefinition attributes},
   * {@link module:ui/template~TemplateDefinition event listeners}, and
   * `textContent` of {@link module:ui/template~TemplateDefinition children} only.
   *
   * **Note:** Existing `class` and `style` attributes are extended when a template
   * is applied to an HTML element, while other attributes and `textContent` are overridden.
   *
   * **Note:** The process of applying a template can be easily reverted using the
   * {@link module:ui/template~Template#revert} method.
   *
   * ```ts
   * const element = document.createElement( 'div' );
   * const observable = new Model( { divClass: 'my-div' } );
   * const emitter = Object.create( EmitterMixin );
   * const bind = Template.bind( observable, emitter );
   *
   * new Template( {
   * 	attributes: {
   * 		id: 'first-div',
   * 		class: bind.to( 'divClass' )
   * 	},
   * 	on: {
   * 		click: bind( 'elementClicked' ) // Will be fired by the observable.
   * 	},
   * 	children: [
   * 		'Div text.'
   * 	]
   * } ).apply( element );
   *
   * console.log( element.outerHTML ); // -> '<div id="first-div" class="my-div"></div>'
   * ```
   *
   * @see module:ui/template~Template#render
   * @see module:ui/template~Template#revert
   * @param node Root node for the template to apply.
   */
  apply(t) {
    return this._revertData = ke(), this._renderNode({
      node: t,
      intoFragment: !1,
      isApplying: !0,
      revertData: this._revertData
    }), t;
  }
  /**
   * Reverts a template {@link module:ui/template~Template#apply applied} to a DOM node.
   *
   * @param node The root node for the template to revert. In most of the cases, it is the
   * same node used by {@link module:ui/template~Template#apply}.
   */
  revert(t) {
    if (!this._revertData)
      throw new w("ui-template-revert-not-applied", [this, t]);
    this._revertTemplateFromNode(t, this._revertData);
  }
  /**
   * Returns an iterator which traverses the template in search of {@link module:ui/view~View}
   * instances and returns them one by one.
   *
   * ```ts
   * const viewFoo = new View();
   * const viewBar = new View();
   * const viewBaz = new View();
   * const template = new Template( {
   * 	tag: 'div',
   * 	children: [
   * 		viewFoo,
   * 		{
   * 			tag: 'div',
   * 			children: [
   * 				viewBar
   * 			]
   * 		},
   * 		viewBaz
   * 	]
   * } );
   *
   * // Logs: viewFoo, viewBar, viewBaz
   * for ( const view of template.getViews() ) {
   * 	console.log( view );
   * }
   * ```
   */
  *getViews() {
    function* t(n) {
      if (n.children)
        for (const i of n.children)
          B(i) ? yield i : ee(i) && (yield* t(i));
    }
    yield* t(this);
  }
  /**
   * An entry point to the interface which binds DOM nodes to
   * {@link module:utils/observablemixin~Observable observables}.
   * There are two types of bindings:
   *
   * * HTML element attributes or text `textContent` synchronized with attributes of an
   * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}
   * and {@link module:ui/template~BindChain#if}.
   *
   * ```ts
   * const bind = Template.bind( observable, emitter );
   *
   * new Template( {
   * 	attributes: {
   * 		// Binds the element "class" attribute to observable#classAttribute.
   * 		class: bind.to( 'classAttribute' )
   * 	}
   * } ).render();
   * ```
   *
   * * DOM events fired on HTML element propagated through
   * {@link module:utils/observablemixin~Observable}. Learn more about {@link module:ui/template~BindChain#to}.
   *
   * ```ts
   * const bind = Template.bind( observable, emitter );
   *
   * new Template( {
   * 	on: {
   * 		// Will be fired by the observable.
   * 		click: bind( 'elementClicked' )
   * 	}
   * } ).render();
   * ```
   *
   * Also see {@link module:ui/view~View#bindTemplate}.
   *
   * @param observable An observable which provides boundable attributes.
   * @param emitter An emitter that listens to observable attribute
   * changes or DOM Events (depending on the kind of the binding). Usually, a {@link module:ui/view~View} instance.
   */
  static bind(t, n) {
    return {
      to(i, r) {
        return new Ur({
          eventNameOrFunction: i,
          attribute: i,
          observable: t,
          emitter: n,
          callback: r
        });
      },
      if(i, r, o) {
        return new et({
          observable: t,
          emitter: n,
          attribute: i,
          valueIfTrue: r,
          callback: o
        });
      }
    };
  }
  /**
   * Extends an existing {@link module:ui/template~Template} instance with some additional content
   * from another {@link module:ui/template~TemplateDefinition}.
   *
   * ```ts
   * const bind = Template.bind( observable, emitter );
   *
   * const template = new Template( {
   * 	tag: 'p',
   * 	attributes: {
   * 		class: 'a',
   * 		data-x: bind.to( 'foo' )
   * 	},
   * 	children: [
   * 		{
   * 			tag: 'span',
   * 			attributes: {
   * 				class: 'b'
   * 			},
   * 			children: [
   * 				'Span'
   * 			]
   * 		}
   * 	]
   *  } );
   *
   * // Instance-level extension.
   * Template.extend( template, {
   * 	attributes: {
   * 		class: 'b',
   * 		data-x: bind.to( 'bar' )
   * 	},
   * 	children: [
   * 		{
   * 			attributes: {
   * 				class: 'c'
   * 			}
   * 		}
   * 	]
   * } );
   *
   * // Child extension.
   * Template.extend( template.children[ 0 ], {
   * 	attributes: {
   * 		class: 'd'
   * 	}
   * } );
   * ```
   *
   * the `outerHTML` of `template.render()` is:
   *
   * ```html
   * <p class="a b" data-x="{ observable.foo } { observable.bar }">
   * 	<span class="b c d">Span</span>
   * </p>
   * ```
   *
   * @param template An existing template instance to be extended.
   * @param def Additional definition to be applied to a template.
   */
  static extend(t, n) {
    if (t._isRendered)
      throw new w("template-extend-render", [this, t]);
    rt(t, De(Ee(n)));
  }
  /**
   * Renders a DOM Node (either an HTML element or text) out of the template.
   *
   * @param data Rendering data.
   */
  _renderNode(t) {
    let n;
    if (t.node ? n = this.tag && this.text : n = this.tag ? this.text : !this.text, n)
      throw new w("ui-template-wrong-syntax", this);
    return this.text ? this._renderText(t) : this._renderElement(t);
  }
  /**
   * Renders an HTML element out of the template.
   *
   * @param data Rendering data.
   */
  _renderElement(t) {
    let n = t.node;
    return n || (n = t.node = document.createElementNS(this.ns || Mr, this.tag)), this._renderAttributes(t), this._renderElementChildren(t), this._setUpListeners(t), n;
  }
  /**
   * Renders a text node out of {@link module:ui/template~Template#text}.
   *
   * @param data Rendering data.
   */
  _renderText(t) {
    let n = t.node;
    return n ? t.revertData.text = n.textContent : n = t.node = document.createTextNode(""), N(this.text) ? this._bindToObservable({
      schema: this.text,
      updater: zr(n),
      data: t
    }) : n.textContent = this.text.join(""), n;
  }
  /**
   * Renders HTML element attributes out of {@link module:ui/template~Template#attributes}.
   *
   * @param data Rendering data.
   */
  _renderAttributes(t) {
    if (!this.attributes)
      return;
    const n = t.node, i = t.revertData;
    for (const r in this.attributes) {
      const o = n.getAttribute(r), s = this.attributes[r];
      i && (i.attributes[r] = o);
      const u = Oe(s) ? s[0].ns : null;
      if (N(s)) {
        const c = Oe(s) ? s[0].value : s;
        i && Pe(r) && c.unshift(o), this._bindToObservable({
          schema: c,
          updater: Gr(n, r, u),
          data: t
        });
      } else if (r == "style" && typeof s[0] != "string")
        this._renderStyleAttribute(s[0], t);
      else {
        i && o && Pe(r) && s.unshift(o);
        const c = s.map((d) => d && (d.value || d)).reduce((d, _) => d.concat(_), []).reduce(it, "");
        j(c) || n.setAttributeNS(u, r, c);
      }
    }
  }
  /**
   * Renders the `style` attribute of an HTML element based on
   * {@link module:ui/template~Template#attributes}.
   *
   * A style attribute is an object with static values:
   *
   * ```ts
   * attributes: {
   * 	style: {
   * 		color: 'red'
   * 	}
   * }
   * ```
   *
   * or values bound to {@link module:ui/model~Model} properties:
   *
   * ```ts
   * attributes: {
   * 	style: {
   * 		color: bind.to( ... )
   * 	}
   * }
   * ```
   *
   * Note: The `style` attribute is rendered without setting the namespace. It does not seem to be
   * needed.
   *
   * @param styles Styles located in `attributes.style` of {@link module:ui/template~TemplateDefinition}.
   * @param data Rendering data.
   */
  _renderStyleAttribute(t, n) {
    const i = n.node;
    for (const r in t) {
      const o = t[r];
      N(o) ? this._bindToObservable({
        schema: [o],
        updater: Kr(i, r),
        data: n
      }) : i.style[r] = o;
    }
  }
  /**
   * Recursively renders HTML element's children from {@link module:ui/template~Template#children}.
   *
   * @param data Rendering data.
   */
  _renderElementChildren(t) {
    const n = t.node, i = t.intoFragment ? document.createDocumentFragment() : n, r = t.isApplying;
    let o = 0;
    for (const s of this.children)
      if (te(s)) {
        if (!r) {
          s.setParent(n);
          for (const u of s)
            i.appendChild(u.element);
        }
      } else if (B(s))
        r || (s.isRendered || s.render(), i.appendChild(s.element));
      else if (Fe(s))
        i.appendChild(s);
      else if (r) {
        const u = t.revertData, c = ke();
        u.children.push(c), s._renderNode({
          intoFragment: !1,
          node: i.childNodes[o++],
          isApplying: !0,
          revertData: c
        });
      } else
        i.appendChild(s.render());
    t.intoFragment && n.appendChild(i);
  }
  /**
   * Activates `on` event listeners from the {@link module:ui/template~TemplateDefinition}
   * on an HTML element.
   *
   * @param data Rendering data.
   */
  _setUpListeners(t) {
    if (this.eventListeners)
      for (const n in this.eventListeners) {
        const i = this.eventListeners[n].map((r) => {
          const [o, s] = n.split("@");
          return r.activateDomEventListener(o, s, t);
        });
        t.revertData && t.revertData.bindings.push(i);
      }
  }
  /**
   * For a given {@link module:ui/template~TemplateValueSchema} containing {@link module:ui/template~TemplateBinding}
   * activates the binding and sets its initial value.
   *
   * Note: {@link module:ui/template~TemplateValueSchema} can be for HTML element attributes or
   * text node `textContent`.
   *
   * @param options Binding options.
   * @param options.updater A function which updates the DOM (like attribute or text).
   * @param options.data Rendering data.
   */
  _bindToObservable({ schema: t, updater: n, data: i }) {
    const r = i.revertData;
    tt(t, n, i);
    const o = t.filter((s) => !j(s)).filter((s) => s.observable).map((s) => s.activateAttributeListener(t, n, i));
    r && r.bindings.push(o);
  }
  /**
   * Reverts {@link module:ui/template~RenderData#revertData template data} from a node to
   * return it to the original state.
   *
   * @param node A node to be reverted.
   * @param revertData An object that stores information about what changes have been made by
   * {@link #apply} to the node. See {@link module:ui/template~RenderData#revertData} for more information.
   */
  _revertTemplateFromNode(t, n) {
    for (const r of n.bindings)
      for (const o of r)
        o();
    if (n.text) {
      t.textContent = n.text;
      return;
    }
    const i = t;
    for (const r in n.attributes) {
      const o = n.attributes[r];
      o === null ? i.removeAttribute(r) : i.setAttribute(r, o);
    }
    for (let r = 0; r < n.children.length; ++r)
      this._revertTemplateFromNode(i.childNodes[r], n.children[r]);
  }
}
class F {
  /**
   * Creates an instance of the {@link module:ui/template~TemplateBinding} class.
   *
   * @param def The definition of the binding.
   */
  constructor(t) {
    this.attribute = t.attribute, this.observable = t.observable, this.emitter = t.emitter, this.callback = t.callback;
  }
  /**
   * Returns the value of the binding. It is the value of the {@link module:ui/template~TemplateBinding#attribute} in
   * {@link module:ui/template~TemplateBinding#observable}. The value may be processed by the
   * {@link module:ui/template~TemplateBinding#callback}, if such has been passed to the binding.
   *
   * @param node A native DOM node, passed to the custom {@link module:ui/template~TemplateBinding#callback}.
   * @returns The value of {@link module:ui/template~TemplateBinding#attribute} in
   * {@link module:ui/template~TemplateBinding#observable}.
   */
  getValue(t) {
    const n = this.observable[this.attribute];
    return this.callback ? this.callback(n, t) : n;
  }
  /**
   * Activates the listener which waits for changes of the {@link module:ui/template~TemplateBinding#attribute} in
   * {@link module:ui/template~TemplateBinding#observable}, then updates the DOM with the aggregated
   * value of {@link module:ui/template~TemplateValueSchema}.
   *
   * @param schema A full schema to generate an attribute or text in the DOM.
   * @param updater A DOM updater function used to update the native DOM attribute or text.
   * @param data Rendering data.
   * @returns A function to sever the listener binding.
   */
  activateAttributeListener(t, n, i) {
    const r = () => tt(t, n, i);
    return this.emitter.listenTo(this.observable, `change:${this.attribute}`, r), () => {
      this.emitter.stopListening(this.observable, `change:${this.attribute}`, r);
    };
  }
}
class Ur extends F {
  constructor(t) {
    super(t), this.eventNameOrFunction = t.eventNameOrFunction;
  }
  /**
   * Activates the listener for the native DOM event, which when fired, is propagated by
   * the {@link module:ui/template~TemplateBinding#emitter}.
   *
   * @param domEvtName The name of the native DOM event.
   * @param domSelector The selector in the DOM to filter delegated events.
   * @param data Rendering data.
   * @returns A function to sever the listener binding.
   */
  activateDomEventListener(t, n, i) {
    const r = (o, s) => {
      (!n || s.target.matches(n)) && (typeof this.eventNameOrFunction == "function" ? this.eventNameOrFunction(s) : this.observable.fire(this.eventNameOrFunction, s));
    };
    return this.emitter.listenTo(i.node, t, r), () => {
      this.emitter.stopListening(i.node, t, r);
    };
  }
}
class et extends F {
  constructor(t) {
    super(t), this.valueIfTrue = t.valueIfTrue;
  }
  /**
   * @inheritDoc
   */
  getValue(t) {
    const n = super.getValue(t);
    return j(n) ? !1 : this.valueIfTrue || !0;
  }
}
function N(e) {
  return e ? (e.value && (e = e.value), Array.isArray(e) ? e.some(N) : e instanceof F) : !1;
}
function Rr(e, t) {
  return e.map((n) => n instanceof F ? n.getValue(t) : n);
}
function tt(e, t, { node: n }) {
  const i = Rr(e, n);
  let r;
  e.length == 1 && e[0] instanceof et ? r = i[0] : r = i.reduce(it, ""), j(r) ? t.remove() : t.set(r);
}
function zr(e) {
  return {
    set(t) {
      e.textContent = t;
    },
    remove() {
      e.textContent = "";
    }
  };
}
function Gr(e, t, n) {
  return {
    set(i) {
      e.setAttributeNS(n, t, i);
    },
    remove() {
      e.removeAttributeNS(n, t);
    }
  };
}
function Kr(e, t) {
  return {
    set(n) {
      e.style[t] = n;
    },
    remove() {
      e.style[t] = null;
    }
  };
}
function Ee(e) {
  return Br(e, (n) => {
    if (n && (n instanceof F || ee(n) || B(n) || te(n)))
      return n;
  });
}
function De(e) {
  if (typeof e == "string" ? e = qr(e) : e.text && Xr(e), e.on && (e.eventListeners = Wr(e.on), delete e.on), !e.text) {
    e.attributes && Hr(e.attributes);
    const t = [];
    if (e.children)
      if (te(e.children))
        t.push(e.children);
      else
        for (const n of e.children)
          ee(n) || B(n) || Fe(n) ? t.push(n) : t.push(new D(n));
    e.children = t;
  }
  return e;
}
function Hr(e) {
  for (const t in e)
    e[t].value && (e[t].value = Y(e[t].value)), nt(e, t);
}
function Wr(e) {
  for (const t in e)
    nt(e, t);
  return e;
}
function qr(e) {
  return {
    text: [e]
  };
}
function Xr(e) {
  e.text = Y(e.text);
}
function nt(e, t) {
  e[t] = Y(e[t]);
}
function it(e, t) {
  return j(t) ? e : j(e) ? t : `${e} ${t}`;
}
function Se(e, t) {
  for (const n in t)
    e[n] ? e[n].push(...t[n]) : e[n] = t[n];
}
function rt(e, t) {
  if (t.attributes && (e.attributes || (e.attributes = {}), Se(e.attributes, t.attributes)), t.eventListeners && (e.eventListeners || (e.eventListeners = {}), Se(e.eventListeners, t.eventListeners)), t.text && e.text.push(...t.text), t.children && t.children.length) {
    if (e.children.length != t.children.length)
      throw new w("ui-template-extend-children-mismatch", e);
    let n = 0;
    for (const i of t.children)
      rt(e.children[n++], i);
  }
}
function j(e) {
  return !e && e !== 0;
}
function B(e) {
  return e instanceof S;
}
function ee(e) {
  return e instanceof D;
}
function te(e) {
  return e instanceof Ne;
}
function Oe(e) {
  return I(e[0]) && e[0].ns;
}
function ke() {
  return {
    children: [],
    bindings: [],
    attributes: {}
  };
}
function Pe(e) {
  return e == "class" || e == "style";
}
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class S extends at(X()) {
  /**
   * Creates an instance of the {@link module:ui/view~View} class.
   *
   * Also see {@link #render}.
   *
   * @param locale The localization services instance.
   */
  constructor(t) {
    super(), this.element = null, this.isRendered = !1, this.locale = t, this.t = t && t.t, this._viewCollections = new Ie(), this._unboundChildren = this.createCollection(), this._viewCollections.on("add", (n, i) => {
      i.locale = t, i.t = t && t.t;
    }), this.decorate("render");
  }
  /**
   * Shorthand for {@link module:ui/template~Template.bind}, a binding
   * {@link module:ui/template~BindChain interface} pre–configured for the view instance.
   *
   * It provides {@link module:ui/template~BindChain#to `to()`} and
   * {@link module:ui/template~BindChain#if `if()`} methods that initialize bindings with
   * observable attributes and attach DOM listeners.
   *
   * ```ts
   * class SampleView extends View {
   * 	constructor( locale ) {
   * 		super( locale );
   *
   * 		const bind = this.bindTemplate;
   *
   * 		// These {@link module:utils/observablemixin~Observable observable} attributes will control
   * 		// the state of the view in DOM.
   * 		this.set( {
   * 			elementClass: 'foo',
   * 		 	isEnabled: true
   * 		 } );
   *
   * 		this.setTemplate( {
   * 			tag: 'p',
   *
   * 			attributes: {
   * 				// The class HTML attribute will follow elementClass
   * 				// and isEnabled view attributes.
   * 				class: [
   * 					bind.to( 'elementClass' )
   * 					bind.if( 'isEnabled', 'present-when-enabled' )
   * 				]
   * 			},
   *
   * 			on: {
   * 				// The view will fire the "clicked" event upon clicking <p> in DOM.
   * 				click: bind.to( 'clicked' )
   * 			}
   * 		} );
   * 	}
   * }
   * ```
   */
  get bindTemplate() {
    return this._bindTemplate ? this._bindTemplate : this._bindTemplate = D.bind(this, this);
  }
  /**
   * Creates a new collection of views, which can be used as
   * {@link module:ui/template~Template#children} of this view.
   *
   * ```ts
   * class SampleView extends View {
   * 	constructor( locale ) {
   * 		super( locale );
   *
   * 		const child = new ChildView( locale );
   * 		this.items = this.createCollection( [ child ] );
   *
   * 		this.setTemplate( {
   * 			tag: 'p',
   *
   * 			// `items` collection will render here.
   * 			children: this.items
   * 		} );
   * 	}
   * }
   *
   * const view = new SampleView( locale );
   * view.render();
   *
   * // It will append <p><child#element></p> to the <body>.
   * document.body.appendChild( view.element );
   * ```
   *
   * @param views Initial views of the collection.
   * @returns A new collection of view instances.
   */
  createCollection(t) {
    const n = new Ne(t);
    return this._viewCollections.add(n), n;
  }
  /**
   * Registers a new child view under the view instance. Once registered, a child
   * view is managed by its parent, including {@link #render rendering}
   * and {@link #destroy destruction}.
   *
   * To revert this, use {@link #deregisterChild}.
   *
   * ```ts
   * class SampleView extends View {
   * 	constructor( locale ) {
   * 		super( locale );
   *
   * 		this.childA = new SomeChildView( locale );
   * 		this.childB = new SomeChildView( locale );
   *
   * 		this.setTemplate( { tag: 'p' } );
   *
   * 		// Register the children.
   * 		this.registerChild( [ this.childA, this.childB ] );
   * 	}
   *
   * 	render() {
   * 		super.render();
   *
   * 		this.element.appendChild( this.childA.element );
   * 		this.element.appendChild( this.childB.element );
   * 	}
   * }
   *
   * const view = new SampleView( locale );
   *
   * view.render();
   *
   * // Will append <p><childA#element><b></b><childB#element></p>.
   * document.body.appendChild( view.element );
   * ```
   *
   * **Note**: There's no need to add child views if they're already referenced in the
   * {@link #template}:
   *
   * ```ts
   * class SampleView extends View {
   * 	constructor( locale ) {
   * 		super( locale );
   *
   * 		this.childA = new SomeChildView( locale );
   * 		this.childB = new SomeChildView( locale );
   *
   * 		this.setTemplate( {
   * 			tag: 'p',
   *
   * 			// These children will be added automatically. There's no
   * 			// need to call {@link #registerChild} for any of them.
   * 			children: [ this.childA, this.childB ]
   * 		} );
   * 	}
   *
   * 	// ...
   * }
   * ```
   *
   * @param children Children views to be registered.
   */
  registerChild(t) {
    ie(t) || (t = [t]);
    for (const n of t)
      this._unboundChildren.add(n);
  }
  /**
   * The opposite of {@link #registerChild}. Removes a child view from this view instance.
   * Once removed, the child is no longer managed by its parent, e.g. it can safely
   * become a child of another parent view.
   *
   * @see #registerChild
   * @param children Child views to be removed.
   */
  deregisterChild(t) {
    ie(t) || (t = [t]);
    for (const n of t)
      this._unboundChildren.remove(n);
  }
  /**
   * Sets the {@link #template} of the view with with given definition.
   *
   * A shorthand for:
   *
   * ```ts
   * view.setTemplate( definition );
   * ```
   *
   * @param definition Definition of view's template.
   */
  setTemplate(t) {
    this.template = new D(t);
  }
  /**
   * {@link module:ui/template~Template.extend Extends} the {@link #template} of the view with
   * with given definition.
   *
   * A shorthand for:
   *
   * ```ts
   * Template.extend( view.template, definition );
   * ```
   *
   * **Note**: Is requires the {@link #template} to be already set. See {@link #setTemplate}.
   *
   * @param definition Definition which extends the {@link #template}.
   */
  extendTemplate(t) {
    D.extend(this.template, t);
  }
  /**
   * Recursively renders the view.
   *
   * Once the view is rendered:
   * * the {@link #element} becomes an HTML element out of {@link #template},
   * * the {@link #isRendered} flag is set `true`.
   *
   * **Note**: The children of the view:
   * * defined directly in the {@link #template}
   * * residing in collections created by the {@link #createCollection} method,
   * * and added by {@link #registerChild}
   * are also rendered in the process.
   *
   * In general, `render()` method is the right place to keep the code which refers to the
   * {@link #element} and should be executed at the very beginning of the view's life cycle.
   *
   * It is possible to {@link module:ui/template~Template.extend} the {@link #template} before
   * the view is rendered. To allow an early customization of the view (e.g. by its parent),
   * such references should be done in `render()`.
   *
   * ```ts
   * class SampleView extends View {
   * 	constructor() {
   * 		this.setTemplate( {
   * 			// ...
   * 		} );
   * 	},
   *
   * 	render() {
   * 		// View#element becomes available.
   * 		super.render();
   *
   * 		// The "scroll" listener depends on #element.
   * 		this.listenTo( window, 'scroll', () => {
   * 			// A reference to #element would render the #template and make it non-extendable.
   * 			if ( window.scrollY > 0 ) {
   * 				this.element.scrollLeft = 100;
   * 			} else {
   * 				this.element.scrollLeft = 0;
   * 			}
   * 		} );
   * 	}
   * }
   *
   * const view = new SampleView();
   *
   * // Let's customize the view before it gets rendered.
   * view.extendTemplate( {
   * 	attributes: {
   * 		class: [
   * 			'additional-class'
   * 		]
   * 	}
   * } );
   *
   * // Late rendering allows customization of the view.
   * view.render();
   * ```
   */
  render() {
    if (this.isRendered)
      throw new w("ui-view-render-already-rendered", this);
    this.template && (this.element = this.template.render(), this.registerChild(this.template.getViews())), this.isRendered = !0;
  }
  /**
   * Recursively destroys the view instance and child views added by {@link #registerChild} and
   * residing in collections created by the {@link #createCollection}.
   *
   * Destruction disables all event listeners:
   * * created on the view, e.g. `view.on( 'event', () => {} )`,
   * * defined in the {@link #template} for DOM events.
   */
  destroy() {
    this.stopListening(), this._viewCollections.map((t) => t.destroy()), this.template && this.template._revertData && this.template.revert(this.element);
  }
}
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class R extends S {
  /**
   * @inheritDoc
   */
  constructor() {
    super();
    const t = this.bindTemplate;
    this.set("content", ""), this.set("viewBox", "0 0 20 20"), this.set("fillColor", ""), this.set("isColorInherited", !0), this.setTemplate({
      tag: "svg",
      ns: "http://www.w3.org/2000/svg",
      attributes: {
        class: [
          "ck",
          "ck-icon",
          // Exclude icon internals from the CSS reset to allow rich (non-monochromatic) icons
          // (https://github.com/ckeditor/ckeditor5/issues/12599).
          "ck-reset_all-excluded",
          // The class to remove the dynamic color inheritance is toggleable
          // (https://github.com/ckeditor/ckeditor5/issues/12599).
          t.if("isColorInherited", "ck-icon_inherit-color")
        ],
        viewBox: t.to("viewBox")
      }
    });
  }
  /**
   * @inheritDoc
   */
  render() {
    super.render(), this._updateXMLContent(), this._colorFillPaths(), this.on("change:content", () => {
      this._updateXMLContent(), this._colorFillPaths();
    }), this.on("change:fillColor", () => {
      this._colorFillPaths();
    });
  }
  /**
   * Updates the {@link #element} with the value of {@link #content}.
   */
  _updateXMLContent() {
    if (this.content) {
      const n = new DOMParser().parseFromString(this.content.trim(), "image/svg+xml").querySelector("svg"), i = n.getAttribute("viewBox");
      i && (this.viewBox = i);
      for (const { name: r, value: o } of Array.from(n.attributes))
        R.presentationalAttributeNames.includes(r) && this.element.setAttribute(r, o);
      for (; this.element.firstChild; )
        this.element.removeChild(this.element.firstChild);
      for (; n.childNodes.length > 0; )
        this.element.appendChild(n.childNodes[0]);
    }
  }
  /**
   * Fills all child `path.ck-icon__fill` with the `#fillColor`.
   */
  _colorFillPaths() {
    this.fillColor && this.element.querySelectorAll(".ck-icon__fill").forEach((t) => {
      t.style.fill = this.fillColor;
    });
  }
}
R.presentationalAttributeNames = [
  "alignment-baseline",
  "baseline-shift",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-rendering",
  "cursor",
  "direction",
  "display",
  "dominant-baseline",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flood-color",
  "flood-opacity",
  "font-family",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-variant",
  "font-weight",
  "image-rendering",
  "letter-spacing",
  "lighting-color",
  "marker-end",
  "marker-mid",
  "marker-start",
  "mask",
  "opacity",
  "overflow",
  "paint-order",
  "pointer-events",
  "shape-rendering",
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "text-anchor",
  "text-decoration",
  "text-overflow",
  "text-rendering",
  "transform",
  "unicode-bidi",
  "vector-effect",
  "visibility",
  "white-space",
  "word-spacing",
  "writing-mode"
];
/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
class Yr extends S {
  /**
   * @inheritDoc
   */
  constructor(t) {
    super(t), this._focusDelayed = null;
    const n = this.bindTemplate, i = ct();
    this.set("ariaChecked", void 0), this.set("ariaLabel", void 0), this.set("ariaLabelledBy", `ck-editor__aria-label_${i}`), this.set("class", void 0), this.set("labelStyle", void 0), this.set("icon", void 0), this.set("isEnabled", !0), this.set("isOn", !1), this.set("isVisible", !0), this.set("isToggleable", !1), this.set("keystroke", void 0), this.set("label", void 0), this.set("role", void 0), this.set("tabindex", -1), this.set("tooltip", !1), this.set("tooltipPosition", "s"), this.set("type", "button"), this.set("withText", !1), this.set("withKeystroke", !1), this.children = this.createCollection(), this.labelView = this._createLabelView(), this.iconView = new R(), this.iconView.extendTemplate({
      attributes: {
        class: "ck-button__icon"
      }
    }), this.keystrokeView = this._createKeystrokeView(), this.bind("_tooltipString").to(this, "tooltip", this, "label", this, "keystroke", this._getTooltipString.bind(this));
    const r = {
      tag: "button",
      attributes: {
        class: [
          "ck",
          "ck-button",
          n.to("class"),
          n.if("isEnabled", "ck-disabled", (o) => !o),
          n.if("isVisible", "ck-hidden", (o) => !o),
          n.to("isOn", (o) => o ? "ck-on" : "ck-off"),
          n.if("withText", "ck-button_with-text"),
          n.if("withKeystroke", "ck-button_with-keystroke")
        ],
        role: n.to("role"),
        type: n.to("type", (o) => o || "button"),
        tabindex: n.to("tabindex"),
        "aria-label": n.to("ariaLabel"),
        "aria-labelledby": n.to("ariaLabelledBy"),
        "aria-disabled": n.if("isEnabled", !0, (o) => !o),
        "aria-checked": n.to("isOn"),
        "aria-pressed": n.to("isOn", (o) => this.isToggleable ? String(!!o) : !1),
        "data-cke-tooltip-text": n.to("_tooltipString"),
        "data-cke-tooltip-position": n.to("tooltipPosition")
      },
      children: this.children,
      on: {
        click: n.to((o) => {
          this.isEnabled ? this.fire("execute") : o.preventDefault();
        })
      }
    };
    lt.isSafari && (this._focusDelayed || (this._focusDelayed = dt(() => this.focus(), 0)), r.on.mousedown = n.to(() => {
      this._focusDelayed();
    }), r.on.mouseup = n.to(() => {
      this._focusDelayed.cancel();
    })), this.setTemplate(r);
  }
  /**
   * @inheritDoc
   */
  render() {
    super.render(), this.icon && (this.iconView.bind("content").to(this, "icon"), this.children.add(this.iconView)), this.children.add(this.labelView), this.withKeystroke && this.keystroke && this.children.add(this.keystrokeView);
  }
  /**
   * Focuses the {@link #element} of the button.
   */
  focus() {
    this.element.focus();
  }
  /**
   * @inheritDoc
   */
  destroy() {
    this._focusDelayed && this._focusDelayed.cancel(), super.destroy();
  }
  /**
   * Creates a label view instance and binds it with button attributes.
   */
  _createLabelView() {
    const t = new S(), n = this.bindTemplate;
    return t.setTemplate({
      tag: "span",
      attributes: {
        class: [
          "ck",
          "ck-button__label"
        ],
        style: n.to("labelStyle"),
        id: this.ariaLabelledBy
      },
      children: [
        {
          text: n.to("label")
        }
      ]
    }), t;
  }
  /**
   * Creates a view that displays a keystroke next to a {@link #labelView label }
   * and binds it with button attributes.
   */
  _createKeystrokeView() {
    const t = new S();
    return t.setTemplate({
      tag: "span",
      attributes: {
        class: [
          "ck",
          "ck-button__keystroke"
        ]
      },
      children: [
        {
          text: this.bindTemplate.to("keystroke", (n) => re(n))
        }
      ]
    }), t;
  }
  /**
   * Gets the text for the tooltip from the combination of
   * {@link #tooltip}, {@link #label} and {@link #keystroke} attributes.
   *
   * @see #tooltip
   * @see #_tooltipString
   * @param tooltip Button tooltip.
   * @param label Button label.
   * @param keystroke Button keystroke.
   */
  _getTooltipString(t, n, i) {
    return t ? typeof t == "string" ? t : (i && (i = re(i)), t instanceof Function ? t(n, i) : `${n}${i ? ` (${i})` : ""}`) : "";
  }
}
const Jr = "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='UTF-8'%20standalone='no'?%3e%3c!--%20Created%20with%20Inkscape%20(http://www.inkscape.org/)%20--%3e%3csvg%20width='378.80499'%20height='378.80499'%20viewBox='0%200%20100.22509%20100.22509'%20version='1.1'%20id='svg481'%20sodipodi:docname='definitionlist.svg'%20inkscape:version='1.2.2%20(b0a8486541,%202022-12-01)'%20xmlns:inkscape='http://www.inkscape.org/namespaces/inkscape'%20xmlns:sodipodi='http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:svg='http://www.w3.org/2000/svg'%3e%3csodipodi:namedview%20id='namedview483'%20pagecolor='%23ffffff'%20bordercolor='%23666666'%20borderopacity='1.0'%20inkscape:showpageshadow='2'%20inkscape:pageopacity='0.0'%20inkscape:pagecheckerboard='0'%20inkscape:deskcolor='%23d1d1d1'%20inkscape:document-units='mm'%20showgrid='true'%20inkscape:zoom='0.47559578'%20inkscape:cx='-114.59311'%20inkscape:cy='284.90581'%20inkscape:window-width='1628'%20inkscape:window-height='981'%20inkscape:window-x='0'%20inkscape:window-y='0'%20inkscape:window-maximized='1'%20inkscape:current-layer='layer1'%3e%3cinkscape:grid%20type='xygrid'%20id='grid547'%20originx='-25.036226'%20originy='-22.233422'%20/%3e%3c/sodipodi:namedview%3e%3cdefs%20id='defs478'%20/%3e%3cg%20inkscape:label='Ebene%201'%20inkscape:groupmode='layer'%20id='layer1'%20transform='translate(-25.036325,-22.233511)'%3e%3crect%20id='rect485'%20width='54.620625'%20height='10.888565'%20x='33.952618'%20y='39.922672'%20ry='5.4442825'%20style='stroke-width:0.243551'%20/%3e%3crect%20id='rect485-3'%20width='54.620625'%20height='10.888565'%20x='64.154762'%20y='57.341919'%20ry='5.4442825'%20style='stroke-width:0.243551'%20/%3e%3crect%20id='rect485-6'%20width='54.620625'%20height='10.888565'%20x='34.054344'%20y='75.9683'%20ry='5.4442825'%20style='stroke-width:0.243551'%20/%3e%3crect%20id='rect485-3-7'%20width='54.620625'%20height='10.888565'%20x='64.256485'%20y='93.387543'%20ry='5.4442825'%20style='stroke-width:0.243551'%20/%3e%3c/g%3e%3c/svg%3e";
class eo extends ut {
  static get pluginName() {
    return "DefinitionList";
  }
  init() {
    const t = this.editor, n = t.t;
    t.model, this.defineSchema(), this.defineConverters(), t.commands.add("insertDefinitionList", new Zr(t)), t.commands.add("indentDefinitionTerm", new Le(t, "forward")), t.commands.add("outdentDefinitionDescription", new Le(t, "backward")), t.ui.componentFactory.add("definitionList", (i) => {
      const r = new Yr(i);
      r.set({
        label: n("Definition list"),
        icon: Jr,
        tooltip: !0
      });
      const o = t.commands.get("insertDefinitionList");
      return r.bind("isOn").to(o, "value"), r.on("execute", () => {
        t.execute("insertDefinitionList"), t.editing.view.focus();
      }), r;
    });
  }
  afterInit() {
    const n = this.editor.commands, i = n.get("indent"), r = n.get("outdent");
    i && i.registerChildCommand(n.get("indentDefinitionTerm"), { priority: "high" }), r && r.registerChildCommand(n.get("outdentDefinitionDescription"), { priority: "lowest" });
  }
  defineSchema() {
    const t = this.editor.model.schema;
    t.register("definitionList", {
      allowWhere: "$block",
      allowContentOf: "$block",
      isBlock: !0
    }), t.register("definitionTerm", {
      allowIn: "definitionList",
      allowContentOf: "$block",
      isBlock: !0
    }), t.register("definitionDescription", {
      allowIn: "definitionList",
      allowContentOf: "$block",
      isBlock: !0
    });
  }
  defineConverters() {
    const t = this.editor.conversion;
    t.for("upcast").elementToElement({
      view: "dl",
      model: "definitionList"
    }), t.for("upcast").elementToElement({
      view: "dt",
      model: "definitionTerm"
    }), t.for("upcast").elementToElement({
      view: "dd",
      model: "definitionDescription"
    }), t.for("dataDowncast").elementToElement({
      model: "definitionList",
      view: "dl"
    }), t.for("dataDowncast").elementToElement({
      model: "definitionTerm",
      view: "dt"
    }), t.for("dataDowncast").elementToElement({
      model: "definitionDescription",
      view: "dd"
    }), t.for("editingDowncast").elementToElement({
      model: "definitionList",
      view: (n, { writer: i }) => i.createContainerElement("dl")
    }), t.for("editingDowncast").elementToElement({
      model: "definitionTerm",
      view: (n, { writer: i }) => i.createEditableElement("dt")
    }), t.for("editingDowncast").elementToElement({
      model: "definitionDescription",
      view: (n, { writer: i }) => i.createEditableElement("dd")
    });
  }
}
class Zr extends Ve {
  constructor(t) {
    super(t), this.value = !1;
  }
  execute() {
    const n = this.editor.model;
    n.change((i) => {
      const r = i.createElement("definitionList"), o = i.createElement("definitionTerm"), s = i.createElement("definitionDescription");
      i.insertText("Term", o), i.insertText("Definition", s), i.append(o, r), i.append(s, r), n.insertContent(r), i.setSelection(o, "end");
    });
  }
  refresh() {
    var r;
    const i = !!((r = this.editor.model.document.selection.getFirstPosition()) != null && r.findAncestor("definitionList"));
    this.isEnabled = !0, this.value = i;
  }
}
class Le extends Ve {
  constructor(t, n) {
    super(t), this._direction = n, this._source = this._direction === "forward" ? "definitionTerm" : "definitionDescription", this._target = this._direction === "backward" ? "definitionTerm" : "definitionDescription";
  }
  refresh() {
    const i = this.editor.model.document.selection.getFirstPosition(), r = i == null ? void 0 : i.parent;
    this.isEnabled = (r == null ? void 0 : r.is("element", this._source)) ?? !1;
  }
  execute() {
    this._transformElement(this._source, this._target, () => {
    });
  }
  _transformElement(t, n, i) {
    const r = this.editor.model, s = r.document.selection.getFirstPosition(), u = s == null ? void 0 : s.parent;
    return u != null && u.is("element", t) ? (r.change((c) => {
      const d = c.createElement(n);
      c.insert(d, u, "after");
      const _ = c.createRangeIn(u);
      c.move(_, c.createPositionAt(d, 0)), c.remove(u), c.setSelection(d, "in");
    }), i(), !0) : !1;
  }
}
export {
  eo as DefinitionList,
  eo as default
};
