// node_modules/@lit/reactive-element/css-tag.js
var e = globalThis, t = e.ShadowRoot && (e.ShadyCSS === void 0 || e.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, n = Symbol(), r = /* @__PURE__ */ new WeakMap(), i = class {
	constructor(e, t, r) {
		if (this._$cssResult$ = !0, r !== n) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
		this.cssText = e, this.t = t;
	}
	get styleSheet() {
		let e = this.o, n = this.t;
		if (t && e === void 0) {
			let t = n !== void 0 && n.length === 1;
			t && (e = r.get(n)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), t && r.set(n, e));
		}
		return e;
	}
	toString() {
		return this.cssText;
	}
}, a = (e) => new i(typeof e == "string" ? e : e + "", void 0, n), o = (e, ...t) => new i(e.length === 1 ? e[0] : t.reduce((t, n, r) => t + ((e) => {
	if (!0 === e._$cssResult$) return e.cssText;
	if (typeof e == "number") return e;
	throw Error("Value passed to 'css' function must be a 'css' function result: " + e + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
})(n) + e[r + 1], e[0]), e, n), s = (n, r) => {
	if (t) n.adoptedStyleSheets = r.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
	else for (let t of r) {
		let r = document.createElement("style"), i = e.litNonce;
		i !== void 0 && r.setAttribute("nonce", i), r.textContent = t.cssText, n.appendChild(r);
	}
}, c = t ? (e) => e : (e) => e instanceof CSSStyleSheet ? ((e) => {
	let t = "";
	for (let n of e.cssRules) t += n.cssText;
	return a(t);
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: ee, getPrototypeOf: te } = Object, p = globalThis, m = p.trustedTypes, ne = m ? m.emptyScript : "", re = p.reactiveElementPolyfillSupport, h = (e, t) => e, g = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? ne : null;
				break;
			case Object:
			case Array: e = e == null ? e : JSON.stringify(e);
		}
		return e;
	},
	fromAttribute(e, t) {
		let n = e;
		switch (t) {
			case Boolean:
				n = e !== null;
				break;
			case Number:
				n = e === null ? null : Number(e);
				break;
			case Object:
			case Array: try {
				n = JSON.parse(e);
			} catch {
				n = null;
			}
		}
		return n;
	}
}, _ = (e, t) => !l(e, t), ie = {
	attribute: !0,
	type: String,
	converter: g,
	reflect: !1,
	useDefault: !1,
	hasChanged: _
};
Symbol.metadata ??= Symbol("metadata"), p.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var v = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = ie) {
		if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
			let n = Symbol(), r = this.getPropertyDescriptor(e, n, t);
			r !== void 0 && u(this.prototype, e, r);
		}
	}
	static getPropertyDescriptor(e, t, n) {
		let { get: r, set: i } = d(this.prototype, e) ?? {
			get() {
				return this[t];
			},
			set(e) {
				this[t] = e;
			}
		};
		return {
			get: r,
			set(t) {
				let a = r?.call(this);
				i?.call(this, t), this.requestUpdate(e, a, n);
			},
			configurable: !0,
			enumerable: !0
		};
	}
	static getPropertyOptions(e) {
		return this.elementProperties.get(e) ?? ie;
	}
	static _$Ei() {
		if (this.hasOwnProperty(h("elementProperties"))) return;
		let e = te(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(h("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(h("properties"))) {
			let e = this.properties, t = [...f(e), ...ee(e)];
			for (let n of t) this.createProperty(n, e[n]);
		}
		let e = this[Symbol.metadata];
		if (e !== null) {
			let t = litPropertyMetadata.get(e);
			if (t !== void 0) for (let [e, n] of t) this.elementProperties.set(e, n);
		}
		this._$Eh = /* @__PURE__ */ new Map();
		for (let [e, t] of this.elementProperties) {
			let n = this._$Eu(e, t);
			n !== void 0 && this._$Eh.set(n, e);
		}
		this.elementStyles = this.finalizeStyles(this.styles);
	}
	static finalizeStyles(e) {
		let t = [];
		if (Array.isArray(e)) {
			let n = new Set(e.flat(1 / 0).reverse());
			for (let e of n) t.unshift(c(e));
		} else e !== void 0 && t.push(c(e));
		return t;
	}
	static _$Eu(e, t) {
		let n = t.attribute;
		return !1 === n ? void 0 : typeof n == "string" ? n : typeof e == "string" ? e.toLowerCase() : void 0;
	}
	constructor() {
		super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
	}
	_$Ev() {
		this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
	}
	addController(e) {
		(this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
	}
	removeController(e) {
		this._$EO?.delete(e);
	}
	_$E_() {
		let e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
		for (let n of t.keys()) this.hasOwnProperty(n) && (e.set(n, this[n]), delete this[n]);
		e.size > 0 && (this._$Ep = e);
	}
	createRenderRoot() {
		let e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
		return s(e, this.constructor.elementStyles), e;
	}
	connectedCallback() {
		this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
	}
	enableUpdating(e) {}
	disconnectedCallback() {
		this._$EO?.forEach((e) => e.hostDisconnected?.());
	}
	attributeChangedCallback(e, t, n) {
		this._$AK(e, n);
	}
	_$ET(e, t) {
		let n = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, n);
		if (r !== void 0 && !0 === n.reflect) {
			let i = (n.converter?.toAttribute === void 0 ? g : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? g : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? _)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
			this.C(e, t, n);
		}
		!1 === this.isUpdatePending && (this._$ES = this._$EP());
	}
	C(e, t, { useDefault: n, reflect: r, wrapped: i }, a) {
		n && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), !0 !== i || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || n || (t = void 0), this._$AL.set(e, t)), !0 === r && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
	}
	async _$EP() {
		this.isUpdatePending = !0;
		try {
			await this._$ES;
		} catch (e) {
			Promise.reject(e);
		}
		let e = this.scheduleUpdate();
		return e != null && await e, !this.isUpdatePending;
	}
	scheduleUpdate() {
		return this.performUpdate();
	}
	performUpdate() {
		if (!this.isUpdatePending) return;
		if (!this.hasUpdated) {
			if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
				for (let [e, t] of this._$Ep) this[e] = t;
				this._$Ep = void 0;
			}
			let e = this.constructor.elementProperties;
			if (e.size > 0) for (let [t, n] of e) {
				let { wrapped: e } = n, r = this[t];
				!0 !== e || this._$AL.has(t) || r === void 0 || this.C(t, void 0, n, r);
			}
		}
		let e = !1, t = this._$AL;
		try {
			e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((e) => e.hostUpdate?.()), this.update(t)) : this._$EM();
		} catch (t) {
			throw e = !1, this._$EM(), t;
		}
		e && this._$AE(t);
	}
	willUpdate(e) {}
	_$AE(e) {
		this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
	}
	_$EM() {
		this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
	}
	get updateComplete() {
		return this.getUpdateComplete();
	}
	getUpdateComplete() {
		return this._$ES;
	}
	shouldUpdate(e) {
		return !0;
	}
	update(e) {
		this._$Eq &&= this._$Eq.forEach((e) => this._$ET(e, this[e])), this._$EM();
	}
	updated(e) {}
	firstUpdated(e) {}
};
v.elementStyles = [], v.shadowRootOptions = { mode: "open" }, v[h("elementProperties")] = /* @__PURE__ */ new Map(), v[h("finalized")] = /* @__PURE__ */ new Map(), re?.({ ReactiveElement: v }), (p.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var y = globalThis, b = (e) => e, x = y.trustedTypes, S = x ? x.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, C = "$lit$", w = `lit$${Math.random().toFixed(9).slice(2)}$`, T = "?" + w, ae = `<${T}>`, E = document, D = () => E.createComment(""), O = (e) => e === null || typeof e != "object" && typeof e != "function", k = Array.isArray, oe = (e) => k(e) || typeof e?.[Symbol.iterator] == "function", A = "[ 	\n\f\r]", j = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, M = /-->/g, N = />/g, P = RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), se = /'/g, ce = /"/g, le = /^(?:script|style|textarea|title)$/i, F = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), I = Symbol.for("lit-noChange"), L = Symbol.for("lit-nothing"), R = /* @__PURE__ */ new WeakMap(), z = E.createTreeWalker(E, 129);
function ue(e, t) {
	if (!k(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return S === void 0 ? t : S.createHTML(t);
}
var de = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = j;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === j ? c[1] === "!--" ? o = M : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (le.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = N : o === P ? c[0] === ">" ? (o = i ?? j, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? ce : se) : o === ce || o === se ? o = P : o === M || o === N ? o = j : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === j ? n + ae : l >= 0 ? (r.push(s), n.slice(0, l) + C + n.slice(l) + w + d) : n + w + (l === -2 ? t : d);
	}
	return [ue(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, B = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = de(t, n);
		if (this.el = e.createElement(l, r), z.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = z.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(C)) {
					let t = u[o++], n = i.getAttribute(e).split(w), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? pe : r[1] === "?" ? me : r[1] === "@" ? he : U
					}), i.removeAttribute(e);
				} else e.startsWith(w) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (le.test(i.tagName)) {
					let e = i.textContent.split(w), t = e.length - 1;
					if (t > 0) {
						i.textContent = x ? x.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], D()), z.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], D());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === T) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(w, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += w.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = E.createElement("template");
		return n.innerHTML = e, n;
	}
};
function V(e, t, n = e, r) {
	if (t === I) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = O(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = V(e, i._$AS(e, t.values), i, r)), t;
}
var fe = class {
	constructor(e, t) {
		this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
	}
	get parentNode() {
		return this._$AM.parentNode;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	u(e) {
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? E).importNode(t, !0);
		z.currentNode = r;
		let i = z.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new H(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new ge(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = z.nextNode(), a++);
		}
		return z.currentNode = E, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, H = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = L, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
	}
	get parentNode() {
		let e = this._$AA.parentNode, t = this._$AM;
		return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
	}
	get startNode() {
		return this._$AA;
	}
	get endNode() {
		return this._$AB;
	}
	_$AI(e, t = this) {
		e = V(this, e, t), O(e) ? e === L || e == null || e === "" ? (this._$AH !== L && this._$AR(), this._$AH = L) : e !== this._$AH && e !== I && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? oe(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== L && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(E.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = B.createElement(ue(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new fe(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = R.get(e.strings);
		return t === void 0 && R.set(e.strings, t = new B(e)), t;
	}
	k(t) {
		k(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(D()), this.O(D()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = b(e).nextSibling;
			b(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, U = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = L, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = L;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = V(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== I, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = V(this, r[n + o], t, o), s === I && (s = this._$AH[o]), a ||= !O(s) || s !== this._$AH[o], s === L ? e = L : e !== L && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === L ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, pe = class extends U {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === L ? void 0 : e;
	}
}, me = class extends U {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== L);
	}
}, he = class extends U {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = V(this, e, t, 0) ?? L) === I) return;
		let n = this._$AH, r = e === L && n !== L || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== L && (n === L || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, ge = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		V(this, e);
	}
}, _e = y.litHtmlPolyfillSupport;
_e?.(B, H), (y.litHtmlVersions ??= []).push("3.3.3");
var ve = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new H(t.insertBefore(D(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, W = globalThis, G = class extends v {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ve(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return I;
	}
};
G._$litElement$ = !0, G.finalized = !0, W.litElementHydrateSupport?.({ LitElement: G });
var ye = W.litElementPolyfillSupport;
ye?.({ LitElement: G }), (W.litElementVersions ??= []).push("4.2.2");
// src/format.ts
var be = 6e4;
function K(e) {
	if (!e) return null;
	let t = Date.parse(e);
	return Number.isNaN(t) ? null : t;
}
function xe(e, t) {
	return Math.floor((e - t) / be);
}
function Se(e, t, n) {
	if (e === null) return {
		value: "–",
		unit: !1
	};
	let r = xe(e, t);
	if (r <= 0) return {
		value: n,
		unit: !1
	};
	if (r < 60) return {
		value: String(r),
		unit: !0
	};
	let i = Math.floor(r / 60), a = r % 60;
	return {
		value: `${i}h ${String(a).padStart(2, "0")}`,
		unit: !1
	};
}
function Ce(e, t, n) {
	try {
		return new Intl.DateTimeFormat(t, {
			hour: "2-digit",
			minute: "2-digit",
			hour12: !1,
			timeZone: n
		}).format(e);
	} catch {
		let t = new Date(e);
		return `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
	}
}
function q(e) {
	return e == null || e === 0 ? null : e > 0 ? `+${e}` : `${e}`;
}
function we(e, t, n) {
	if (n) return "cancelled";
	if (e === null) return "relaxed";
	let r = (e - t) / be;
	return r < -.5 ? "missed" : r < 1 ? "now" : r < 4 ? "soon" : "relaxed";
}
function Te(e, t) {
	return e !== null && e < t - 3e4;
}
function Ee(e, t, n) {
	return e.filter((e) => !Te(K(e.departure), t)).slice(0, n);
}
function J(e) {
	return (e ?? []).map((e) => typeof e == "string" ? { entity: e } : e).filter((e) => !!e?.entity);
}
function Y(e) {
	let t = J(e.entries);
	return t.length ? t : [...J(e.connections), ...J(e.departures)];
}
function X(e) {
	let t = e?.attributes?.bvg_type;
	return t === "connection" || t === "departure_board" ? t : null;
}
function De(e) {
	let t = Object.keys(e);
	return [...t.filter((t) => X(e[t]) === "connection"), ...t.filter((t) => X(e[t]) === "departure_board")];
}
function Oe(e, t) {
	return e.entries.length ? e.entries : De(t).map((e) => ({ entity: e }));
}
function ke(e) {
	return {
		type: e.type,
		title: e.title,
		entries: Y(e),
		max_journeys: Math.max(1, Number(e.max_journeys ?? 3)),
		max_departures: Math.max(1, Number(e.max_departures ?? 6)),
		show_clock: e.show_clock ?? !0,
		show_header: e.show_header ?? !0,
		show_footer: e.show_footer ?? !0,
		expand: e.expand ?? !1
	};
}
function Ae(e) {
	return e === "suburban" ? "pill" : e === "subway" ? "square" : "rect";
}
var je = {
	suburban: "mdi:train-variant",
	subway: "mdi:subway-variant",
	tram: "mdi:tram",
	bus: "mdi:bus",
	ferry: "mdi:ferry",
	regional: "mdi:train",
	express: "mdi:train"
};
function Me(e) {
	return e && Object.hasOwn(je, e) ? {
		icon: je[e],
		tone: e
	} : {
		icon: "mdi:transit-connection-variant",
		tone: "muted"
	};
}
function Ne(e) {
	let t = /^#?([0-9a-f]{6})$/i.exec(e);
	if (!t) return "#fff";
	let n = parseInt(t[1], 16), [r, i, a] = [
		n >> 16 & 255,
		n >> 8 & 255,
		n & 255
	];
	return .299 * r + .587 * i + .114 * a > 160 ? "#000" : "#fff";
}
// src/i18n.ts
var Pe = {
	now: "jetzt",
	min: "min",
	in: "in",
	leave_in: "Los in {m} min",
	leave_now: "Jetzt los!",
	missed: "Nicht mehr zu schaffen",
	hurry: "Beeilen",
	on_time: "pünktlich",
	cancelled: "Ausfall",
	at_risk: "Anschluss?",
	no_realtime: "Plan",
	transfers_0: "direkt",
	transfers_1: "1 Umstieg",
	transfers_n: "{n} Umstiege",
	walk: "{m} min Fußweg",
	walk_to_stop: "Fußweg zur Haltestelle",
	walk_distance: "{d} m Fußweg",
	transfer: "Umstieg",
	platform: "Gl.",
	direction: "Richtung",
	departure: "ab",
	arrival: "an",
	arrival_label: "Ankunft",
	arrival_label_short: "An",
	updated: "Stand",
	stale: "Daten veraltet",
	realtime: "Echtzeit",
	no_journeys: "Keine Verbindungen gefunden",
	no_departures: "Keine Abfahrten",
	not_found: "Entität nicht gefunden",
	wrong_entity: "Keine BVG-Entität (Nächste Abfahrt wählen)",
	remarks: "{n} Hinweise",
	remark: "1 Hinweis",
	more: "Mehr",
	occupancy_low: "wenig ausgelastet",
	occupancy_medium: "mittel ausgelastet",
	occupancy_high: "stark ausgelastet",
	departures_title: "Abfahrten",
	no_entries: "Noch keine Verbindungen oder Abfahrtstafeln angelegt",
	editor_title: "Titel",
	editor_entries: "Verbindungen und Abfahrtstafeln",
	editor_entries_helper: "Leer lassen, um alle zu zeigen, auch später angelegte. Die Karte zeigt die Auswahl in dieser Reihenfolge.",
	editor_max_journeys: "Max. Verbindungen je Gruppe",
	editor_max_departures: "Max. Abfahrten je Tafel",
	editor_show_clock: "Uhr anzeigen",
	editor_show_header: "Kopfzeile anzeigen",
	editor_show_footer: "Aktualisierungszeit anzeigen",
	editor_expand: "Details anfangs aufgeklappt"
}, Fe = {
	now: "now",
	min: "min",
	in: "in",
	leave_in: "Leave in {m} min",
	leave_now: "Leave now!",
	missed: "Too late",
	hurry: "Hurry",
	on_time: "on time",
	cancelled: "Cancelled",
	at_risk: "Connection?",
	no_realtime: "Scheduled",
	transfers_0: "direct",
	transfers_1: "1 transfer",
	transfers_n: "{n} transfers",
	walk: "{m} min walk",
	walk_to_stop: "Walk to the stop",
	walk_distance: "{d} m walk",
	transfer: "Transfer",
	platform: "Pl.",
	direction: "towards",
	departure: "dep",
	arrival: "arr.",
	arrival_label: "Arrival",
	arrival_label_short: "Arr",
	updated: "Updated",
	stale: "Data outdated",
	realtime: "Realtime",
	no_journeys: "No connections found",
	no_departures: "No departures",
	not_found: "Entity not found",
	wrong_entity: "Not a BVG entity (pick “Next departure”)",
	remarks: "{n} notices",
	remark: "1 notice",
	more: "More",
	occupancy_low: "low occupancy",
	occupancy_medium: "medium occupancy",
	occupancy_high: "high occupancy",
	departures_title: "Departures",
	no_entries: "No connections or departure boards set up yet",
	editor_title: "Title",
	editor_entries: "Connections and departure boards",
	editor_entries_helper: "Leave empty to show all of them, including ones added later. The card shows the selection in this order.",
	editor_max_journeys: "Max. connections per group",
	editor_max_departures: "Max. departures per board",
	editor_show_clock: "Show clock",
	editor_show_header: "Show header",
	editor_show_footer: "Show update time",
	editor_expand: "Expand details by default"
};
function Ie(e, t, n = {}) {
	return (((e ?? "en").toLowerCase().startsWith("de") ? Pe : Fe)[t] ?? t).replace(/\{(\w+)\}/g, (e, t) => String(n[t] ?? ""));
}
// src/define.ts
function Le(e, t) {
	let n = () => {
		customElements.get(e) || customElements.define(e, t);
	};
	customElements.get("home-assistant") || !document.querySelector("home-assistant") ? n() : customElements.whenDefined("home-assistant").then(n);
}
// src/remark-text.ts
var Re = {
	amp: "&",
	lt: "<",
	gt: ">",
	quot: "\"",
	apos: "'",
	nbsp: " ",
	auml: "ä",
	ouml: "ö",
	uuml: "ü",
	Auml: "Ä",
	Ouml: "Ö",
	Uuml: "Ü",
	szlig: "ß",
	eacute: "é",
	egrave: "è",
	ndash: "–",
	mdash: "—",
	hellip: "…",
	bdquo: "„",
	ldquo: "“",
	rdquo: "”",
	laquo: "«",
	raquo: "»",
	euro: "€"
}, ze = /* @__PURE__ */ new Set(["script", "style"]), Be = /* @__PURE__ */ new Set([
	"br",
	"p",
	"div",
	"li"
]), Ve = /^\[?\s*(mehr|more)(\s*\/\s*(mehr|more))?\s*\]?$/i;
function Z(e) {
	return e.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (e, t) => {
		if (t[0] === "#") {
			let n = t[1] === "x" || t[1] === "X" ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10);
			return Number.isFinite(n) && n > 0 && n <= 1114111 ? String.fromCodePoint(n) : e;
		}
		return Object.hasOwn(Re, t) ? Re[t] : e;
	});
}
function He(e) {
	if (e) try {
		let t = new URL(Z(e).trim());
		return t.protocol === "https:" || t.protocol === "http:" ? t.href : void 0;
	} catch {
		return;
	}
}
function Ue(e) {
	let t = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i.exec(e);
	return He(t ? t[1] ?? t[2] ?? t[3] : void 0);
}
function We(e, t) {
	let n = [], r = (e, t) => {
		if (!e) return;
		let r = n[n.length - 1];
		!t && r && !r.href ? r.text += e : n.push(t ? {
			text: e,
			href: t
		} : { text: e });
	}, i = e ?? "";
	!i.includes("<") && /&lt;/i.test(i) && (i = Z(i));
	let a = /<(\/?)([a-z][a-z0-9]*)\b([^>]*)>|<!--[\s\S]*?-->/gi, o = null, s = null, c = 0, l, u = (e) => {
		s || (o ? o.text += e : r(e));
	};
	for (; l = a.exec(i);) {
		u(i.slice(c, l.index)), c = a.lastIndex;
		let [, e, n, d] = l;
		if (!n) continue;
		let f = n.toLowerCase();
		s ? e && f === s && (s = null) : ze.has(f) && !e ? s = f : f === "a" ? !e && !o ? o = {
			href: Ue(d ?? ""),
			text: ""
		} : e && o && (Ge(o, t, r), o = null) : Be.has(f) && u(" ");
	}
	return u(i.slice(c)), o && Ge(o, t, r), Ke(n);
}
function Ge(e, t, n) {
	let r = Z(e.text).replace(/\s+/g, " ").trim();
	e.href ? n(!r || Ve.test(r) ? t : r, e.href) : r && !Ve.test(r) && n(r);
}
function Ke(e) {
	let t = e.map((e) => ({
		...e,
		text: e.href ? e.text : Z(e.text).replace(/[ \t\r\n\f]+/g, " ")
	})).filter((e) => e.text.trim() !== "");
	return t.length && (t[0].text = t[0].text.trimStart(), t[t.length - 1].text = t[t.length - 1].text.trimEnd()), t;
}
function Q(e, t) {
	return We(e, t).filter((e) => !e.href).map((e) => e.text).join("").trim();
}
// src/styles.ts
var qe = o`
  :host {
    --bvg-ok: var(--success-color, #43a047);
    --bvg-warn: var(--warning-color, #ffa600);
    --bvg-error: var(--error-color, #db4437);
    --bvg-muted: var(--secondary-text-color, #727272);
    --bvg-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --bvg-row-hover: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.04);
    --bvg-chip-bg: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.06);
    --bvg-walk: var(--light-blue-color, #03a9f4);
    display: block;
  }

  /* Tile-style symbols: MDI icon on a tinted circle, like HA tile cards */
  .sym {
    --sym-size: 24px;
    --sym-color: var(--bvg-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--sym-size);
    height: var(--sym-size);
    border-radius: 50%;
    background: color-mix(in srgb, var(--sym-color) 20%, transparent);
    color: var(--sym-color);
    flex: none;
    box-sizing: border-box;
  }
  .sym ha-icon {
    --mdc-icon-size: calc(var(--sym-size) * 0.66);
    display: inline-flex;
  }
  .sym.xs {
    --sym-size: 16px;
  }
  .sym.s {
    --sym-size: 20px;
  }
  .sym.l {
    --sym-size: 32px;
  }
  .tone-place {
    --sym-color: var(--primary-color, #03a9f4);
  }
  .tone-walk {
    --sym-color: var(--bvg-walk);
  }
  .tone-muted {
    --sym-color: var(--bvg-muted);
  }
  .tone-current {
    --sym-color: currentColor;
  }
  .tone-ok {
    --sym-color: var(--bvg-ok);
  }
  .tone-warn {
    --sym-color: var(--bvg-warn);
  }
  .tone-error {
    --sym-color: var(--bvg-error);
  }
  .tone-suburban {
    --sym-color: #008d4f;
  }
  .tone-subway {
    --sym-color: #0a3c85;
  }
  .dark .tone-subway {
    --sym-color: #5c8fd6;
  }
  .tone-tram {
    --sym-color: #be1414;
  }
  .tone-bus {
    --sym-color: #a5027d;
  }
  .dark .tone-bus {
    --sym-color: #d04aa9;
  }
  .tone-ferry {
    --sym-color: #0080ba;
  }
  .tone-regional,
  .tone-express {
    --sym-color: #e2001a;
  }
  .dark .tone-tram,
  .dark .tone-regional,
  .dark .tone-express {
    --sym-color: #f04a4a;
  }
  ha-card {
    overflow: hidden;
    padding-bottom: 4px;
  }
  .header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 16px 4px;
  }
  .title {
    font-size: var(--ha-font-size-xl, 20px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.3;
    color: var(--primary-text-color);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .clock {
    font-size: 28px;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.5px;
    color: var(--primary-text-color);
  }
  section {
    padding: 8px 0 4px;
  }
  section + section {
    border-top: 1px solid var(--bvg-divider);
    margin-top: 4px;
  }
  .group-head {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 4px 16px 6px;
    color: var(--bvg-muted);
    font-size: var(--ha-font-size-s, 13px);
    font-weight: 500;
    min-width: 0;
  }
  .group-head .places {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .group-head .place-line {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .group-head .place-line.dest {
    padding-left: 6px;
  }
  .group-head .place {
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .group-head .spacer {
    flex: 1;
    min-width: 4px;
  }
  .group-head .chip {
    align-self: center;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px 2px 2px;
    border-radius: 999px;
    background: var(--bvg-chip-bg);
    color: var(--bvg-muted);
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    flex: none;
  }
  .chip.stale {
    background: color-mix(in srgb, var(--bvg-warn) 18%, transparent);
    color: var(--primary-text-color);
  }

  /* Journey rows: leave/status | lines+meta | big arrival */
  .journey {
    --bvg-leave-col: 7.75rem;
    position: relative;
    display: grid;
    grid-template-columns: var(--bvg-leave-col) 1fr auto;
    align-items: center;
    column-gap: 12px;
    padding: 8px 16px 8px 20px;
    cursor: pointer;
    outline: none;
    transition: background-color 120ms ease;
    container-type: inline-size;
    container-name: journey;
  }
  .journey:hover,
  .journey:focus-visible {
    background: var(--bvg-row-hover);
  }
  .journey::before {
    content: "";
    position: absolute;
    left: 8px;
    top: 9px;
    bottom: 9px;
    width: 4px;
    border-radius: 2px;
    background: var(--urgency-color, var(--bvg-ok));
  }
  .u-relaxed {
    --urgency-color: var(--bvg-ok);
  }
  .u-soon {
    --urgency-color: var(--bvg-warn);
  }
  .u-now {
    --urgency-color: var(--bvg-warn);
  }
  .u-missed,
  .u-cancelled {
    --urgency-color: var(--bvg-error);
  }
  .u-missed .times,
  .u-missed .chain,
  .u-missed .meta {
    opacity: 0.55;
  }
  .leave-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  .times {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 56px;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .time-label {
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1.2;
    color: var(--bvg-muted);
    text-transform: none;
  }
  .time-label .short {
    display: none;
  }
  .arr-time {
    font-size: 26px;
    font-weight: 500;
    line-height: 1.1;
    color: var(--primary-text-color);
  }
  .planned {
    font-size: 11px;
    color: var(--bvg-muted);
    text-decoration: line-through;
    line-height: 1.2;
  }
  .late {
    color: var(--bvg-warn);
  }
  .very-late {
    color: var(--bvg-error);
  }
  .cancelled-text {
    text-decoration: line-through;
    text-decoration-color: var(--bvg-error);
    text-decoration-thickness: 2px;
    color: var(--bvg-muted);
  }
  .main {
    min-width: 0;
  }
  .chain {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px 2px;
  }
  .chain > .sym {
    margin-right: 2px;
  }
  .sep {
    color: var(--bvg-muted);
    font-size: 14px;
    margin: 0 1px;
    line-height: 1;
  }
  .meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 8px;
    margin-top: 3px;
    font-size: 12px;
    color: var(--bvg-muted);
    font-variant-numeric: tabular-nums;
  }
  .meta .dep-meta {
    color: var(--primary-text-color);
  }
  .countdown {
    display: flex;
    align-items: baseline;
    gap: 2px;
    font-size: 22px;
    font-weight: 500;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    white-space: nowrap;
  }
  .countdown .unit {
    font-size: 12px;
    font-weight: 400;
    color: var(--bvg-muted);
  }
  .leave {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    max-width: 100%;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--urgency-color);
  }
  .u-relaxed .leave {
    color: var(--bvg-muted);
  }
  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;
    color: var(--sym-color);
  }
  .status.tone-muted {
    font-weight: 500;
  }
  @container journey (max-width: 380px) {
    .time-label .long {
      display: none;
    }
    .time-label .short {
      display: inline;
    }
  }

  /* Line badges */
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    height: 20px;
    padding: 0 5px;
    box-sizing: border-box;
    font-size: 12.5px;
    font-weight: 700;
    letter-spacing: 0.1px;
    line-height: 1;
    border-radius: 3px;
    white-space: nowrap;
    flex: none;
  }
  .badge.pill {
    border-radius: 999px;
    padding: 0 7px;
  }
  .badge.square {
    border-radius: 2px;
  }
  .badge.cancelled {
    opacity: 0.55;
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }
  .badge.large {
    min-width: 40px;
    height: 24px;
    font-size: 13.5px;
  }

  /* Details */
  .details {
    padding: 2px 16px 10px 20px;
    border-bottom: 1px dashed var(--bvg-divider);
    margin-bottom: 4px;
  }
  .leg {
    display: grid;
    grid-template-columns: 52px 64px 1fr;
    column-gap: 10px;
    padding: 6px 0;
    font-size: 13px;
    align-items: start;
  }
  .leg + .leg {
    border-top: 1px solid var(--bvg-divider);
  }
  .leg .t {
    display: flex;
    flex-direction: column;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    line-height: 1.45;
  }
  .leg .t small {
    color: var(--bvg-muted);
    font-size: 11px;
  }
  .leg .route {
    min-width: 0;
    line-height: 1.45;
  }
  .leg .stop {
    color: var(--primary-text-color);
  }
  .leg .sub {
    color: var(--bvg-muted);
    font-size: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 0 8px;
    align-items: center;
  }
  .leg.walk {
    color: var(--bvg-muted);
    font-size: 12px;
    align-items: center;
  }
  .leg .line {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .leg.walk .sym {
    justify-self: start;
  }
  .platform-changed {
    color: var(--bvg-warn);
    font-weight: 600;
  }
  .occupancy {
    display: inline-flex;
    align-items: center;
  }
  .occupancy ha-icon {
    --mdc-icon-size: 15px;
  }
  .occupancy.high {
    color: var(--bvg-error);
  }
  .occupancy.medium {
    color: var(--bvg-warn);
  }
  .remark {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--primary-text-color);
  }
  .remark .sym {
    margin-top: -1px;
  }
  .remark a {
    color: var(--primary-color);
    font-weight: 500;
    text-decoration: none;
  }
  .remark a:hover,
  .remark a:focus-visible {
    text-decoration: underline;
  }

  /* Departure board */
  .departure {
    display: grid;
    grid-template-columns: 24px 44px 1fr auto auto;
    align-items: center;
    column-gap: 10px;
    padding: 5px 16px;
    min-height: 32px;
  }
  .departure .dir {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .departure .dir span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--primary-text-color);
    font-size: 14px;
  }
  .departure .dir small {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--bvg-muted);
  }
  .planned-inline {
    text-decoration: line-through;
  }
  .departure .delay {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
    font-size: 13px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    text-align: right;
    min-width: 24px;
  }
  .departure .countdown {
    font-size: 17px;
    min-width: 44px;
    justify-content: flex-end;
  }
  .departure.unreachable {
    opacity: 0.45;
  }
  .departure.is-cancelled .dir span:first-child {
    text-decoration: line-through;
    text-decoration-color: var(--bvg-error);
    color: var(--bvg-muted);
  }
  .notices {
    margin: 4px 16px 4px;
    padding: 6px 10px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--bvg-warn) 10%, transparent);
    cursor: pointer;
  }
  .notices .summary {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--primary-text-color);
  }
  .notices .summary > ha-icon {
    --mdc-icon-size: 16px;
    color: var(--bvg-muted);
  }
  .notices .spacer {
    flex: 1;
  }
  .notices .summary .preview {
    font-weight: 400;
    color: var(--bvg-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .empty,
  .warning {
    padding: 8px 16px;
    color: var(--bvg-muted);
    font-size: 13px;
  }
  .warning {
    color: var(--bvg-error);
  }
  .footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    padding: 4px 16px 6px;
    font-size: 11px;
    color: var(--bvg-muted);
    font-variant-numeric: tabular-nums;
  }
  .footer .stale-text {
    color: var(--bvg-warn);
    font-weight: 500;
  }
`, Je = {
	integration: "bvg_connections",
	domain: "sensor",
	device_class: "timestamp"
}, Ye = [{
	type: "grid",
	name: "",
	schema: [{
		name: "max_journeys",
		selector: { number: {
			min: 1,
			max: 8,
			mode: "box"
		} }
	}, {
		name: "max_departures",
		selector: { number: {
			min: 1,
			max: 20,
			mode: "box"
		} }
	}]
}, {
	type: "grid",
	name: "",
	schema: [
		{
			name: "show_header",
			selector: { boolean: {} }
		},
		{
			name: "show_clock",
			selector: { boolean: {} }
		},
		{
			name: "show_footer",
			selector: { boolean: {} }
		},
		{
			name: "expand",
			selector: { boolean: {} }
		}
	]
}];
function Xe(e) {
	return [
		{
			name: "title",
			selector: { text: {} }
		},
		{
			name: "entries",
			selector: { entity: {
				multiple: !0,
				filter: Je,
				include_entities: De(e)
			} }
		},
		...Ye
	];
}
function Ze(e, t) {
	let n = {
		type: e.type,
		...t
	}, r = Y(e), i = (t.entries ?? []).map((e) => r.find((t) => t.entity === e && t.name) ?? e);
	return delete n.connections, delete n.departures, i.length ? n.entries = i : delete n.entries, n.title || delete n.title, n;
}
Le("bvg-connections-card-editor", class extends G {
	constructor(...e) {
		super(...e), this._label = (e) => e.name ? this._t(`editor_${e.name}`) : "", this._helper = (e) => e.name === "entries" ? this._t("editor_entries_helper") : void 0;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	setConfig(e) {
		this._config = e;
	}
	_t(e) {
		return Ie(this.hass?.locale?.language ?? this.hass?.language, e);
	}
	render() {
		if (!this.hass || !this._config) return L;
		let { connections: e, departures: t, ...n } = this._config, r = {
			max_journeys: 3,
			max_departures: 6,
			show_header: !0,
			show_clock: !0,
			show_footer: !0,
			expand: !1,
			...n,
			entries: Y(this._config).map((e) => e.entity)
		};
		return F`<ha-form
      .hass=${this.hass}
      .data=${r}
      .schema=${Xe(this.hass.states)}
      .computeLabel=${this._label}
      .computeHelper=${this._helper}
      @value-changed=${this._changed}
    ></ha-form>`;
	}
	_changed(e) {
		e.stopPropagation();
		let t = Ze(this._config ?? { type: "custom:bvg-connections-card" }, e.detail.value);
		this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: t },
			bubbles: !0,
			composed: !0
		}));
	}
});
// src/card.ts
var Qe = "0.1.2", $e = {
	ok: ["mdi:check", "ok"],
	delayed: ["mdi:clock-alert-outline", "warn"],
	connection_at_risk: ["mdi:transit-transfer", "warn"],
	cancelled: ["mdi:cancel", "error"],
	no_realtime: ["mdi:clock-outline", "muted"]
}, et = 5e3, tt = class extends G {
	constructor(...e) {
		super(...e), this._now = Date.now(), this._expanded = /* @__PURE__ */ new Set(), this._collapsed = /* @__PURE__ */ new Set(), this._openNotices = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = qe;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_now: { state: !0 },
			_expanded: { state: !0 },
			_collapsed: { state: !0 },
			_openNotices: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("bvg-connections-card-editor");
	}
	static getStubConfig() {
		return { type: "custom:bvg-connections-card" };
	}
	setConfig(e) {
		if (!e) throw Error("Invalid configuration");
		this._config = ke(e);
	}
	getCardSize() {
		let e = this._config;
		if (!e) return 3;
		let t = (this.hass ? this._refs(this.hass) : e.entries).map((t) => X(this.hass?.states[t.entity]) === "departure_board" ? (1 + e.max_departures) / 1.5 : 1 + e.max_journeys);
		return +!!e.show_header + Math.ceil(t.reduce((e, t) => e + t, 0)) || 2;
	}
	_refs(e) {
		return Oe(this._config, e.states);
	}
	getGridOptions() {
		return {
			columns: 12,
			min_columns: 6,
			rows: "auto"
		};
	}
	connectedCallback() {
		super.connectedCallback(), this._now = Date.now(), this._timer = window.setInterval(() => {
			this._now = Date.now();
		}, et);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._timer && window.clearInterval(this._timer);
	}
	shouldUpdate(e) {
		if (!e.has("hass") || e.size > 1) return !0;
		let t = e.get("hass");
		return !t || !this.hass || !this._config || [...new Set([...this._refs(t), ...this._refs(this.hass)].map((e) => e.entity))].some((e) => t.states[e] !== this.hass?.states[e]);
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "de";
	}
	_t(e, t) {
		return Ie(this._lang, e, t);
	}
	_time(e) {
		let t = typeof e == "number" ? e : K(e);
		if (t === null) return "–";
		let n = this.hass?.locale?.time_zone === "local" ? void 0 : this.hass?.config?.time_zone;
		return Ce(t, this._lang, n);
	}
	render() {
		if (!this._config || !this.hass) return L;
		let e = this._config, t = this._refs(this.hass), n = t.map((e) => this.hass.states[e.entity]).filter(Boolean), r = n.filter((e) => X(e) === "connection"), i = e.title ?? (r.length === 1 && n.length === 1 ? String(r[0].attributes.origin ?? "") : "");
		return F`
      <ha-card class=${this.hass.themes?.darkMode ? "dark" : ""}>
        ${e.show_header && (i || e.show_clock) ? F`<div class="header">
              <div class="title">${i}</div>
              ${e.show_clock ? F`<div class="clock">${this._time(this._now)}</div>` : L}
            </div>` : L}
        ${t.length ? t.map((e) => this._renderEntry(e)) : F`<div class="empty">${this._t("no_entries")}</div>`}
        ${e.show_footer ? this._renderFooter(n) : L}
      </ha-card>
    `;
	}
	_renderEntry(e) {
		let t = this.hass.states[e.entity];
		if (!t) return F`<section><div class="warning">${this._t("not_found")}: ${e.entity}</div></section>`;
		let n = X(t);
		return n === "connection" ? this._renderConnection(e, t) : n === "departure_board" ? this._renderBoard(e, t) : F`<section><div class="warning">${e.entity}: ${this._t("wrong_entity")}</div></section>`;
	}
	_renderConnection(e, t) {
		let n = t.attributes, r = Number(n.walk_minutes ?? 0), i = Ee(n.journeys ?? [], this._now, this._config.max_journeys);
		return F`
      <section>
        <div class="group-head">
          <div class="places">
            <div class="place-line">
              ${this._sym("mdi:map-marker", "place", "l")}
              <span class="place">${e.name ?? n.origin}</span>
            </div>
            ${e.name ? L : F`<div class="place-line dest">
                  ${this._sym("mdi:flag-checkered", "place", "s")}
                  <span class="place">${n.destination}</span>
                </div>`}
          </div>
          <span class="spacer"></span>
          ${n.stale ? F`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>` : L}
          ${r ? F`<span class="chip" title=${this._t("walk_to_stop")}
                >${this._sym("mdi:walk", "walk", "s")}${r} ${this._t("min")}</span
              >` : L}
        </div>
        ${i.length ? i.map((e, n) => this._renderJourney(t.entity_id, e, n, r)) : F`<div class="empty">${this._t("no_journeys")}</div>`}
      </section>
    `;
	}
	_journeyKey(e, t) {
		return `${e}:${t.planned_departure ?? t.departure}:${t.lines.join(">")}`;
	}
	_isExpanded(e) {
		return this._config.expand ? !this._collapsed.has(e) : this._expanded.has(e);
	}
	_renderJourney(e, t, n, r) {
		let i = this._journeyKey(e, t), a = K(t.departure), o = K(t.leave_at), s = t.status === "cancelled", c = we(r ? o : a, this._now, s), l = this._isExpanded(i), u = Se(a, this._now, this._t("now")), d = q(t.arrival_delay), f = t.legs.find((e) => !e.walking);
		return F`
      <div
        class="journey u-${c}"
        role="button"
        tabindex="0"
        aria-expanded=${l ? "true" : "false"}
        @click=${() => this._toggle(i)}
        @keydown=${(e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), this._toggle(i));
		}}
        data-index=${n}
      >
        <div class="leave-col">
          ${this._status(t)}
          <span class="countdown"
            >${u.value}${u.unit ? F`<span class="unit">${this._t("min")}</span>` : L}</span
          >
          ${r && !s ? this._leaveHint(o, c) : L}
        </div>
        <div class="main">
          <div class="chain">
            ${t.starts_with_walk ? this._sym("mdi:walk", "walk") : L}
            ${t.legs.filter((e) => !e.walking).map((e, n) => F`${n || t.starts_with_walk ? F`<span class="sep">›</span>` : L}${this._badge(e.line, e.product, e.color, e.text_color, e.cancelled)}`)}
          </div>
          <div class="meta">
            <span class="dep-meta ${s ? "cancelled-text" : ""}"
              >${this._t("departure")} ${this._time(t.departure)}</span
            >
            ${t.duration === null ? L : F`<span>${t.duration} ${this._t("min")}</span>`}
            <span>${this._transfers(t.transfers)}</span>
            ${f?.platform ? F`<span class=${f.platform_changed ? "platform-changed" : ""}
                  >${this._platform(f.platform)}</span
                >` : L}
            ${t.remarks.some((e) => e.type === "warning") ? this._sym("mdi:alert", "warn", "xs") : L}
          </div>
        </div>
        <div class="times">
          <span class="time-label"
            ><span class="long">${this._t("arrival_label")}</span
            ><span class="short">${this._t("arrival_label_short")}</span></span
          >
          <span
            class="arr-time ${s ? "cancelled-text" : d ? this._delayClass(t.arrival_delay) : ""}"
            >${this._time(t.arrival)}</span
          >
          ${d && t.planned_arrival && !s ? F`<span class="planned">${this._time(t.planned_arrival)}</span>` : L}
        </div>
      </div>
      ${l ? this._renderDetails(t) : L}
    `;
	}
	_platform(e) {
		return /^\d/.test(e) ? `${this._t("platform")} ${e}` : e;
	}
	_delayClass(e) {
		return e === null || e <= 0 ? "" : e >= 5 ? "very-late" : "late";
	}
	_transfers(e) {
		return e === 0 ? this._t("transfers_0") : e === 1 ? this._t("transfers_1") : this._t("transfers_n", { n: e });
	}
	_status(e) {
		let t = {
			ok: this._t("on_time"),
			cancelled: this._t("cancelled"),
			connection_at_risk: this._t("at_risk"),
			no_realtime: this._t("no_realtime")
		}, n = e.status === "delayed" ? q(e.delay) ?? q(e.arrival_delay) ?? "+" : t[e.status];
		return this._tag(e.status, n);
	}
	_tag(e, t) {
		let [n, r] = $e[e] ?? $e.no_realtime;
		return F`<span class="status tone-${r}">${this._sym(n, r, "s")}${t}</span>`;
	}
	_sym(e, t, n = "m") {
		return F`<span class="sym ${n} tone-${t}"><ha-icon icon=${e}></ha-icon></span>`;
	}
	_productSym(e, t = "m") {
		let { icon: n, tone: r } = Me(e);
		return this._sym(n, r, t);
	}
	_leaveHint(e, t) {
		if (e === null) return L;
		let n = Math.floor((e - this._now) / 6e4), r;
		return r = t === "missed" ? this._t("missed") : n <= 0 ? this._t("leave_now") : this._t("leave_in", { m: n }), F`<span class="leave">${this._sym("mdi:walk", t === "relaxed" ? "walk" : "current", "s")}${r}</span>`;
	}
	_badge(e, t, n, r, i = !1, a = !1) {
		let o = n || "#5f6368", s = r || Ne(o);
		return F`<span
      class="badge ${Ae(t)} ${i ? "cancelled" : ""} ${a ? "large" : ""}"
      style="background:${o};color:${s}"
      >${e ?? "?"}</span
    >`;
	}
	_renderDetails(e) {
		return F`<div class="details">
      ${e.legs.map((e) => e.walking ? this._renderWalk(e) : this._renderLeg(e))}
      ${e.remarks.filter((t) => !e.legs.some((e) => e.remarks.some((e) => e.text === t.text))).map((e) => this._remark(e))}
    </div>`;
	}
	_renderWalk(e) {
		let t = e.departure && e.arrival ? Math.max(1, Math.round((Date.parse(e.arrival) - Date.parse(e.departure)) / 6e4)) : null, n = e.distance ? this._t("walk_distance", { d: e.distance }) : this._t("transfer");
		return F`<div class="leg walk">
      <span class="t">${this._time(e.departure)}</span>
      ${e.distance ? this._sym("mdi:walk", "walk") : this._sym("mdi:transit-transfer", "muted")}
      <span>${n}${t ? ` · ${t} ${this._t("min")}` : ""}${e.to ? ` → ${e.to}` : ""}</span>
    </div>`;
	}
	_renderLeg(e) {
		let t = q(e.departure_delay), n = q(e.arrival_delay);
		return F`<div class="leg">
      <span class="t">
        <span class=${e.cancelled ? "cancelled-text" : this._delayClass(e.departure_delay)}
          >${this._time(e.departure)}${t ? F` <small>${t}</small>` : L}</span
        >
        <span class=${e.cancelled ? "cancelled-text" : this._delayClass(e.arrival_delay)}
          >${this._time(e.arrival)}${n ? F` <small>${n}</small>` : L}</span
        >
      </span>
      <span class="line">
        ${this._productSym(e.product)}${this._badge(e.line, e.product, e.color, e.text_color, e.cancelled)}
      </span>
      <div class="route">
        <div class="stop ${e.cancelled ? "cancelled-text" : ""}">${e.from}</div>
        <div class="sub">
          ${e.direction ? F`<span>${this._t("direction")} ${e.direction}</span>` : L}
          ${e.platform ? F`<span class=${e.platform_changed ? "platform-changed" : ""}>${this._platform(e.platform)}</span>` : L}
          ${this._occupancy(e.occupancy)}
          ${e.cancelled ? this._tag("cancelled", this._t("cancelled")) : L}
          ${!e.reachable && !e.cancelled ? this._tag("connection_at_risk", this._t("at_risk")) : L}
        </div>
        <div class="stop ${e.cancelled ? "cancelled-text" : ""}">${e.to}</div>
        ${e.remarks.map((e) => this._remark(e))}
      </div>
    </div>`;
	}
	_occupancy(e) {
		if (!e) return L;
		let t = e === "high" ? "mdi:account-group" : e === "medium" ? "mdi:account-multiple" : "mdi:account";
		return F`<span class="occupancy ${e}" title=${this._t(`occupancy_${e}`)}><ha-icon icon=${t}></ha-icon></span>`;
	}
	_remark(e) {
		let t = this._t("more"), n = Q(e.summary, t), r = We(e.text, t), i = n && n !== Q(e.text, t);
		return F`<div class="remark is-${e.type}">
      ${e.type === "warning" ? this._sym("mdi:alert", "warn", "s") : this._sym("mdi:information-variant", "muted", "s")}
      <span
        >${i ? F`<b>${n}:</b> ` : L}${r.map((e) => e.href ? F`<a
                href=${e.href}
                target="_blank"
                rel="noopener noreferrer"
                @click=${(e) => e.stopPropagation()}
                >${e.text}</a
              >` : e.text)}</span
      >
    </div>`;
	}
	_renderBoard(e, t) {
		let n = t.attributes, r = Number(n.walk_minutes ?? 0), i = (n.departures ?? []).filter((e) => !Te(K(e.when), this._now)).slice(0, this._config.max_departures), a = this._boardNotices(i), o = this._openNotices.has(t.entity_id);
		return F`
      <section>
        <div class="group-head">
          ${this._sym("mdi:bus-stop", "place", "l")}
          <span class="place">${e.name ?? n.stop}</span>
          <span class="spacer"></span>
          ${n.stale ? F`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>` : L}
          ${r ? F`<span class="chip">${this._sym("mdi:walk", "walk", "s")}${r} ${this._t("min")}</span>` : L}
        </div>
        ${i.length ? i.map((e) => this._renderDeparture(e, r)) : F`<div class="empty">${this._t("no_departures")}</div>`}
        ${a.length ? F`<div class="notices" @click=${() => this._toggleNotices(t.entity_id)}>
              <div class="summary">
                ${this._sym("mdi:alert", "warn", "s")}
                <span>${a.length === 1 ? this._t("remark") : this._t("remarks", { n: a.length })}</span>
                ${o ? L : F`<span class="preview">${Q(a[0].text, this._t("more"))}</span>`}
                <span class="spacer"></span>
                <ha-icon icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              </div>
              ${o ? a.map((e) => this._remark(e)) : L}
            </div>` : L}
      </section>
    `;
	}
	_boardNotices(e) {
		let t = /* @__PURE__ */ new Set(), n = [];
		for (let r of e) for (let e of r.remarks) e.type === "warning" && !t.has(e.text) && (t.add(e.text), n.push(e));
		return n;
	}
	_renderDeparture(e, t) {
		let n = K(e.when), r = K(e.leave_at), i = !t || r === null || r >= this._now - 3e4, a = Se(n, this._now, this._t("now")), o = q(e.delay), s = o && e.planned_when && !e.cancelled ? this._time(e.planned_when) : null;
		return F`<div class="departure ${e.cancelled ? "is-cancelled" : ""} ${i ? "" : "unreachable"}">
      ${this._productSym(e.product)}
      ${this._badge(e.line, e.product, e.color, e.text_color, !1, !0)}
      <div class="dir">
        <span>${e.direction}</span>
        ${e.platform || s || e.cancelled ? F`<small>
              ${e.cancelled ? this._tag("cancelled", this._t("cancelled")) : L}
              ${s ? F`<span class="planned-inline">${s}</span>` : L}
              ${e.platform ? F`<span class=${e.platform_changed ? "platform-changed" : ""}>${this._platform(e.platform)}</span>` : L}
            </small>` : L}
      </div>
      <span class="delay ${this._delayClass(e.delay)}"
        >${e.cancelled ? "" : F`${(e.delay ?? 0) > 0 ? this._sym("mdi:clock-alert-outline", "current", "xs") : L}${o ?? ""}`}</span
      >
      <span class="countdown ${e.cancelled ? "cancelled-text" : ""}"
        >${a.value}${a.unit ? F`<span class="unit">${this._t("min")}</span>` : L}</span
      >
    </div>`;
	}
	_renderFooter(e) {
		let t = e.map((e) => K(e.attributes.fetched_at)).filter((e) => e !== null);
		return t.length ? F`<div class="footer">
      ${e.some((e) => e.attributes.stale) ? F`<span class="stale-text">${this._t("stale")} ·</span>` : L}
      <span>${this._t("updated")} ${this._time(Math.min(...t))}</span>
    </div>` : L;
	}
	_toggle(e) {
		if (this._config.expand) {
			let t = new Set(this._collapsed);
			t.has(e) ? t.delete(e) : t.add(e), this._collapsed = t;
			return;
		}
		let t = new Set(this._expanded);
		t.has(e) ? t.delete(e) : t.add(e), this._expanded = t;
	}
	_toggleNotices(e) {
		let t = new Set(this._openNotices);
		t.has(e) ? t.delete(e) : t.add(e), this._openNotices = t;
	}
};
Le("bvg-connections-card", tt);
var $ = window;
$.customCards = $.customCards ?? [], $.customCards.some((e) => e.type === "bvg-connections-card") || ($.customCards.push({
	type: "bvg-connections-card",
	name: "BVG Verbindungen",
	description: "Verbindungen mit Umstiegen, Abfahrtstafeln und Losgeh-Hinweisen",
	preview: !0,
	documentationURL: "https://github.com/MaxDeavy/ha-bvg-connections"
}), console.info(`%c BVG-CONNECTIONS-CARD %c ${Qe} `, "color:#fff;background:#f0d722;color:#000;font-weight:700", ""));
export { tt as BvgConnectionsCard };
