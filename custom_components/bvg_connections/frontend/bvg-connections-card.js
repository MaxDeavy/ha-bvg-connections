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
})(e) : e, { is: l, defineProperty: u, getOwnPropertyDescriptor: d, getOwnPropertyNames: f, getOwnPropertySymbols: p, getPrototypeOf: ee } = Object, m = globalThis, h = m.trustedTypes, te = h ? h.emptyScript : "", ne = m.reactiveElementPolyfillSupport, g = (e, t) => e, _ = {
	toAttribute(e, t) {
		switch (t) {
			case Boolean:
				e = e ? te : null;
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
}, v = (e, t) => !l(e, t), y = {
	attribute: !0,
	type: String,
	converter: _,
	reflect: !1,
	useDefault: !1,
	hasChanged: v
};
Symbol.metadata ??= Symbol("metadata"), m.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var b = class extends HTMLElement {
	static addInitializer(e) {
		this._$Ei(), (this.l ??= []).push(e);
	}
	static get observedAttributes() {
		return this.finalize(), this._$Eh && [...this._$Eh.keys()];
	}
	static createProperty(e, t = y) {
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
		return this.elementProperties.get(e) ?? y;
	}
	static _$Ei() {
		if (this.hasOwnProperty(g("elementProperties"))) return;
		let e = ee(this);
		e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
	}
	static finalize() {
		if (this.hasOwnProperty(g("finalized"))) return;
		if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(g("properties"))) {
			let e = this.properties, t = [...f(e), ...p(e)];
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
			let i = (n.converter?.toAttribute === void 0 ? _ : n.converter).toAttribute(t, n.type);
			this._$Em = e, i == null ? this.removeAttribute(r) : this.setAttribute(r, i), this._$Em = null;
		}
	}
	_$AK(e, t) {
		let n = this.constructor, r = n._$Eh.get(e);
		if (r !== void 0 && this._$Em !== r) {
			let e = n.getPropertyOptions(r), i = typeof e.converter == "function" ? { fromAttribute: e.converter } : e.converter?.fromAttribute === void 0 ? _ : e.converter;
			this._$Em = r;
			let a = i.fromAttribute(t, e.type);
			this[r] = a ?? this._$Ej?.get(r) ?? a, this._$Em = null;
		}
	}
	requestUpdate(e, t, n, r = !1, i) {
		if (e !== void 0) {
			let a = this.constructor;
			if (!1 === r && (i = this[e]), n ??= a.getPropertyOptions(e), !((n.hasChanged ?? v)(i, t) || n.useDefault && n.reflect && i === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, n)))) return;
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
b.elementStyles = [], b.shadowRootOptions = { mode: "open" }, b[g("elementProperties")] = /* @__PURE__ */ new Map(), b[g("finalized")] = /* @__PURE__ */ new Map(), ne?.({ ReactiveElement: b }), (m.reactiveElementVersions ??= []).push("2.1.2");
// node_modules/lit-html/lit-html.js
var x = globalThis, S = (e) => e, C = x.trustedTypes, re = C ? C.createPolicy("lit-html", { createHTML: (e) => e }) : void 0, w = "$lit$", T = `lit$${Math.random().toFixed(9).slice(2)}$`, E = "?" + T, ie = `<${E}>`, D = document, O = () => D.createComment(""), k = (e) => e === null || typeof e != "object" && typeof e != "function", A = Array.isArray, ae = (e) => A(e) || typeof e?.[Symbol.iterator] == "function", j = "[ 	\n\f\r]", M = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, N = /-->/g, oe = />/g, P = RegExp(`>|${j}(?:([^\\s"'>=/]+)(${j}*=${j}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`, "g"), se = /'/g, F = /"/g, I = /^(?:script|style|textarea|title)$/i, L = ((e) => (t, ...n) => ({
	_$litType$: e,
	strings: t,
	values: n
}))(1), R = Symbol.for("lit-noChange"), z = Symbol.for("lit-nothing"), B = /* @__PURE__ */ new WeakMap(), V = D.createTreeWalker(D, 129);
function H(e, t) {
	if (!A(e) || !e.hasOwnProperty("raw")) throw Error("invalid template strings array");
	return re === void 0 ? t : re.createHTML(t);
}
var ce = (e, t) => {
	let n = e.length - 1, r = [], i, a = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", o = M;
	for (let t = 0; t < n; t++) {
		let n = e[t], s, c, l = -1, u = 0;
		for (; u < n.length && (o.lastIndex = u, c = o.exec(n), c !== null);) u = o.lastIndex, o === M ? c[1] === "!--" ? o = N : c[1] === void 0 ? c[2] === void 0 ? c[3] !== void 0 && (o = P) : (I.test(c[2]) && (i = RegExp("</" + c[2], "g")), o = P) : o = oe : o === P ? c[0] === ">" ? (o = i ?? M, l = -1) : c[1] === void 0 ? l = -2 : (l = o.lastIndex - c[2].length, s = c[1], o = c[3] === void 0 ? P : c[3] === "\"" ? F : se) : o === F || o === se ? o = P : o === N || o === oe ? o = M : (o = P, i = void 0);
		let d = o === P && e[t + 1].startsWith("/>") ? " " : "";
		a += o === M ? n + ie : l >= 0 ? (r.push(s), n.slice(0, l) + w + n.slice(l) + T + d) : n + T + (l === -2 ? t : d);
	}
	return [H(e, a + (e[n] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), r];
}, U = class e {
	constructor({ strings: t, _$litType$: n }, r) {
		let i;
		this.parts = [];
		let a = 0, o = 0, s = t.length - 1, c = this.parts, [l, u] = ce(t, n);
		if (this.el = e.createElement(l, r), V.currentNode = this.el.content, n === 2 || n === 3) {
			let e = this.el.content.firstChild;
			e.replaceWith(...e.childNodes);
		}
		for (; (i = V.nextNode()) !== null && c.length < s;) {
			if (i.nodeType === 1) {
				if (i.hasAttributes()) for (let e of i.getAttributeNames()) if (e.endsWith(w)) {
					let t = u[o++], n = i.getAttribute(e).split(T), r = /([.?@])?(.*)/.exec(t);
					c.push({
						type: 1,
						index: a,
						name: r[2],
						strings: n,
						ctor: r[1] === "." ? ue : r[1] === "?" ? de : r[1] === "@" ? fe : K
					}), i.removeAttribute(e);
				} else e.startsWith(T) && (c.push({
					type: 6,
					index: a
				}), i.removeAttribute(e));
				if (I.test(i.tagName)) {
					let e = i.textContent.split(T), t = e.length - 1;
					if (t > 0) {
						i.textContent = C ? C.emptyScript : "";
						for (let n = 0; n < t; n++) i.append(e[n], O()), V.nextNode(), c.push({
							type: 2,
							index: ++a
						});
						i.append(e[t], O());
					}
				}
			} else if (i.nodeType === 8) {
				if (i.data === E) c.push({
					type: 2,
					index: a
				});
				else {
					let e = -1;
					for (; (e = i.data.indexOf(T, e + 1)) !== -1;) c.push({
						type: 7,
						index: a
					}), e += T.length - 1;
				}
			}
			a++;
		}
	}
	static createElement(e, t) {
		let n = D.createElement("template");
		return n.innerHTML = e, n;
	}
};
function W(e, t, n = e, r) {
	if (t === R) return t;
	let i = r === void 0 ? n._$Cl : n._$Co?.[r], a = k(t) ? void 0 : t._$litDirective$;
	return i?.constructor !== a && (i?._$AO?.(!1), a === void 0 ? i = void 0 : (i = new a(e), i._$AT(e, n, r)), r === void 0 ? n._$Cl = i : (n._$Co ??= [])[r] = i), i !== void 0 && (t = W(e, i._$AS(e, t.values), i, r)), t;
}
var le = class {
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
		let { el: { content: t }, parts: n } = this._$AD, r = (e?.creationScope ?? D).importNode(t, !0);
		V.currentNode = r;
		let i = V.nextNode(), a = 0, o = 0, s = n[0];
		for (; s !== void 0;) {
			if (a === s.index) {
				let t;
				s.type === 2 ? t = new G(i, i.nextSibling, this, e) : s.type === 1 ? t = new s.ctor(i, s.name, s.strings, this, e) : s.type === 6 && (t = new pe(i, this, e)), this._$AV.push(t), s = n[++o];
			}
			a !== s?.index && (i = V.nextNode(), a++);
		}
		return V.currentNode = D, r;
	}
	p(e) {
		let t = 0;
		for (let n of this._$AV) n !== void 0 && (n.strings === void 0 ? n._$AI(e[t]) : (n._$AI(e, n, t), t += n.strings.length - 2)), t++;
	}
}, G = class e {
	get _$AU() {
		return this._$AM?._$AU ?? this._$Cv;
	}
	constructor(e, t, n, r) {
		this.type = 2, this._$AH = z, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = n, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
		e = W(this, e, t), k(e) ? e === z || e == null || e === "" ? (this._$AH !== z && this._$AR(), this._$AH = z) : e !== this._$AH && e !== R && this._(e) : e._$litType$ === void 0 ? e.nodeType === void 0 ? ae(e) ? this.k(e) : this._(e) : this.T(e) : this.$(e);
	}
	O(e) {
		return this._$AA.parentNode.insertBefore(e, this._$AB);
	}
	T(e) {
		this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
	}
	_(e) {
		this._$AH !== z && k(this._$AH) ? this._$AA.nextSibling.data = e : this.T(D.createTextNode(e)), this._$AH = e;
	}
	$(e) {
		let { values: t, _$litType$: n } = e, r = typeof n == "number" ? this._$AC(e) : (n.el === void 0 && (n.el = U.createElement(H(n.h, n.h[0]), this.options)), n);
		if (this._$AH?._$AD === r) this._$AH.p(t);
		else {
			let e = new le(r, this), n = e.u(this.options);
			e.p(t), this.T(n), this._$AH = e;
		}
	}
	_$AC(e) {
		let t = B.get(e.strings);
		return t === void 0 && B.set(e.strings, t = new U(e)), t;
	}
	k(t) {
		A(this._$AH) || (this._$AH = [], this._$AR());
		let n = this._$AH, r, i = 0;
		for (let a of t) i === n.length ? n.push(r = new e(this.O(O()), this.O(O()), this, this.options)) : r = n[i], r._$AI(a), i++;
		i < n.length && (this._$AR(r && r._$AB.nextSibling, i), n.length = i);
	}
	_$AR(e = this._$AA.nextSibling, t) {
		for (this._$AP?.(!1, !0, t); e !== this._$AB;) {
			let t = S(e).nextSibling;
			S(e).remove(), e = t;
		}
	}
	setConnected(e) {
		this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
	}
}, K = class {
	get tagName() {
		return this.element.tagName;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	constructor(e, t, n, r, i) {
		this.type = 1, this._$AH = z, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = i, n.length > 2 || n[0] !== "" || n[1] !== "" ? (this._$AH = Array(n.length - 1).fill(/* @__PURE__ */ new String()), this.strings = n) : this._$AH = z;
	}
	_$AI(e, t = this, n, r) {
		let i = this.strings, a = !1;
		if (i === void 0) e = W(this, e, t, 0), a = !k(e) || e !== this._$AH && e !== R, a && (this._$AH = e);
		else {
			let r = e, o, s;
			for (e = i[0], o = 0; o < i.length - 1; o++) s = W(this, r[n + o], t, o), s === R && (s = this._$AH[o]), a ||= !k(s) || s !== this._$AH[o], s === z ? e = z : e !== z && (e += (s ?? "") + i[o + 1]), this._$AH[o] = s;
		}
		a && !r && this.j(e);
	}
	j(e) {
		e === z ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
	}
}, ue = class extends K {
	constructor() {
		super(...arguments), this.type = 3;
	}
	j(e) {
		this.element[this.name] = e === z ? void 0 : e;
	}
}, de = class extends K {
	constructor() {
		super(...arguments), this.type = 4;
	}
	j(e) {
		this.element.toggleAttribute(this.name, !!e && e !== z);
	}
}, fe = class extends K {
	constructor(e, t, n, r, i) {
		super(e, t, n, r, i), this.type = 5;
	}
	_$AI(e, t = this) {
		if ((e = W(this, e, t, 0) ?? z) === R) return;
		let n = this._$AH, r = e === z && n !== z || e.capture !== n.capture || e.once !== n.once || e.passive !== n.passive, i = e !== z && (n === z || r);
		r && this.element.removeEventListener(this.name, this, n), i && this.element.addEventListener(this.name, this, e), this._$AH = e;
	}
	handleEvent(e) {
		typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
	}
}, pe = class {
	constructor(e, t, n) {
		this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = n;
	}
	get _$AU() {
		return this._$AM._$AU;
	}
	_$AI(e) {
		W(this, e);
	}
}, me = x.litHtmlPolyfillSupport;
me?.(U, G), (x.litHtmlVersions ??= []).push("3.3.3");
var he = (e, t, n) => {
	let r = n?.renderBefore ?? t, i = r._$litPart$;
	if (i === void 0) {
		let e = n?.renderBefore ?? null;
		r._$litPart$ = i = new G(t.insertBefore(O(), e), e, void 0, n ?? {});
	}
	return i._$AI(e), i;
}, q = globalThis, J = class extends b {
	constructor() {
		super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
	}
	createRenderRoot() {
		let e = super.createRenderRoot();
		return this.renderOptions.renderBefore ??= e.firstChild, e;
	}
	update(e) {
		let t = this.render();
		this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = he(t, this.renderRoot, this.renderOptions);
	}
	connectedCallback() {
		super.connectedCallback(), this._$Do?.setConnected(!0);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._$Do?.setConnected(!1);
	}
	render() {
		return R;
	}
};
J._$litElement$ = !0, J.finalized = !0, q.litElementHydrateSupport?.({ LitElement: J });
var ge = q.litElementPolyfillSupport;
ge?.({ LitElement: J }), (q.litElementVersions ??= []).push("4.2.2");
// src/format.ts
var Y = 6e4;
function X(e) {
	if (!e) return null;
	let t = Date.parse(e);
	return Number.isNaN(t) ? null : t;
}
function _e(e, t) {
	return Math.floor((e - t) / Y);
}
function Z(e, t, n) {
	if (e === null) return {
		value: "–",
		unit: !1
	};
	let r = _e(e, t);
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
function ve(e, t, n) {
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
function Q(e) {
	return e == null || e === 0 ? null : e > 0 ? `+${e}` : `${e}`;
}
function ye(e, t, n) {
	if (n) return "cancelled";
	if (e === null) return "relaxed";
	let r = (e - t) / Y;
	return r < -.5 ? "missed" : r < 1 ? "now" : r < 4 ? "soon" : "relaxed";
}
function be(e, t) {
	return e !== null && e < t - 3e4;
}
function xe(e, t, n) {
	return e.filter((e) => !be(X(e.departure), t)).slice(0, n);
}
function $(e) {
	return (e ?? []).map((e) => typeof e == "string" ? { entity: e } : e).filter((e) => !!e?.entity);
}
function Se(e) {
	return {
		type: e.type,
		title: e.title,
		connections: $(e.connections),
		departures: $(e.departures),
		max_journeys: Math.max(1, Number(e.max_journeys ?? 3)),
		max_departures: Math.max(1, Number(e.max_departures ?? 6)),
		show_clock: e.show_clock ?? !0,
		show_header: e.show_header ?? !0,
		show_footer: e.show_footer ?? !0,
		expand: e.expand ?? !1
	};
}
function Ce(e) {
	return e === "suburban" ? "pill" : e === "subway" ? "square" : "rect";
}
var we = {
	suburban: "mdi:train-variant",
	subway: "mdi:subway-variant",
	tram: "mdi:tram",
	bus: "mdi:bus",
	ferry: "mdi:ferry",
	regional: "mdi:train",
	express: "mdi:train"
};
function Te(e) {
	return e && Object.hasOwn(we, e) ? {
		icon: we[e],
		tone: e
	} : {
		icon: "mdi:transit-connection-variant",
		tone: "muted"
	};
}
function Ee(e) {
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
var De = {
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
	arrival: "an",
	updated: "Stand",
	stale: "Daten veraltet",
	realtime: "Echtzeit",
	no_journeys: "Keine Verbindungen gefunden",
	no_departures: "Keine Abfahrten",
	not_found: "Entität nicht gefunden",
	wrong_entity: "Keine BVG-Entität (Nächste Abfahrt wählen)",
	remarks: "{n} Hinweise",
	remark: "1 Hinweis",
	occupancy_low: "wenig ausgelastet",
	occupancy_medium: "mittel ausgelastet",
	occupancy_high: "stark ausgelastet",
	departures_title: "Abfahrten",
	editor_title: "Titel",
	editor_connections: "Verbindungen",
	editor_departures: "Abfahrtstafeln",
	editor_max_journeys: "Max. Verbindungen je Gruppe",
	editor_max_departures: "Max. Abfahrten je Tafel",
	editor_show_clock: "Uhr anzeigen",
	editor_show_header: "Kopfzeile anzeigen",
	editor_show_footer: "Aktualisierungszeit anzeigen",
	editor_expand: "Details immer aufgeklappt"
}, Oe = {
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
	arrival: "arr.",
	updated: "Updated",
	stale: "Data outdated",
	realtime: "Realtime",
	no_journeys: "No connections found",
	no_departures: "No departures",
	not_found: "Entity not found",
	wrong_entity: "Not a BVG entity (pick “Next departure”)",
	remarks: "{n} notices",
	remark: "1 notice",
	occupancy_low: "low occupancy",
	occupancy_medium: "medium occupancy",
	occupancy_high: "high occupancy",
	departures_title: "Departures",
	editor_title: "Title",
	editor_connections: "Connections",
	editor_departures: "Departure boards",
	editor_max_journeys: "Max. connections per group",
	editor_max_departures: "Max. departures per board",
	editor_show_clock: "Show clock",
	editor_show_header: "Show header",
	editor_show_footer: "Show update time",
	editor_expand: "Always show details"
};
function ke(e, t, n = {}) {
	return ((e ?? "en").toLowerCase().startsWith("de") ? De : Oe)[t].replace(/\{(\w+)\}/g, (e, t) => String(n[t] ?? ""));
}
// src/styles.ts
var Ae = o`
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
    align-items: center;
    gap: 6px;
    padding: 4px 16px 6px;
    color: var(--bvg-muted);
    font-size: var(--ha-font-size-s, 13px);
    font-weight: 500;
    min-width: 0;
  }
  .group-head > ha-icon {
    --mdc-icon-size: 16px;
    flex: none;
  }
  .group-head .sym.l {
    margin-right: 4px;
  }
  .group-head .place {
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .group-head .spacer {
    flex: 1;
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

  /* Journey rows */
  .journey {
    position: relative;
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    column-gap: 12px;
    padding: 8px 16px 8px 20px;
    cursor: pointer;
    outline: none;
    transition: background-color 120ms ease;
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
  .u-missed .chain {
    opacity: 0.55;
  }
  .times {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-width: 52px;
    font-variant-numeric: tabular-nums;
  }
  .dep {
    font-size: 20px;
    font-weight: 500;
    line-height: 1.15;
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
  .meta .arr {
    color: var(--primary-text-color);
  }
  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    text-align: right;
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
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
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
  @media (max-width: 420px) {
    .leave .label-long {
      display: none;
    }
  }
`, je = {
	integration: "bvg_connections",
	domain: "sensor",
	device_class: "timestamp"
}, Me = [
	{
		name: "title",
		selector: { text: {} }
	},
	{
		name: "connections",
		selector: { entity: {
			multiple: !0,
			filter: je
		} }
	},
	{
		name: "departures",
		selector: { entity: {
			multiple: !0,
			filter: je
		} }
	},
	{
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
	},
	{
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
	}
], Ne = class extends J {
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 }
		};
	}
	setConfig(e) {
		this._config = e;
	}
	render() {
		if (!this.hass || !this._config) return z;
		let e = {
			max_journeys: 3,
			max_departures: 6,
			show_header: !0,
			show_clock: !0,
			show_footer: !0,
			expand: !1,
			...this._config,
			connections: $(this._config.connections).map((e) => e.entity),
			departures: $(this._config.departures).map((e) => e.entity)
		};
		return L`<ha-form
      .hass=${this.hass}
      .data=${e}
      .schema=${Me}
      .computeLabel=${(e) => ke(this.hass?.locale?.language ?? this.hass?.language, `editor_${e.name}`)}
      @value-changed=${this._changed}
    ></ha-form>`;
	}
	_changed(e) {
		e.stopPropagation();
		let t = { ...e.detail.value };
		for (let e of ["connections", "departures"]) {
			let n = $(this._config?.[e]);
			t[e] = (t[e] ?? []).map((e) => {
				let t = n.find((t) => t.entity === e);
				return t?.name ? t : e;
			});
		}
		t.title || delete t.title, this._config = t, this.dispatchEvent(new CustomEvent("config-changed", {
			detail: { config: t },
			bubbles: !0,
			composed: !0
		}));
	}
};
customElements.get("bvg-connections-card-editor") || customElements.define("bvg-connections-card-editor", Ne);
// src/card.ts
var Pe = "0.1.0", Fe = {
	ok: ["mdi:check", "ok"],
	delayed: ["mdi:clock-alert-outline", "warn"],
	connection_at_risk: ["mdi:transit-transfer", "warn"],
	cancelled: ["mdi:cancel", "error"],
	no_realtime: ["mdi:clock-outline", "muted"]
}, Ie = 5e3, Le = class extends J {
	constructor(...e) {
		super(...e), this._now = Date.now(), this._expanded = /* @__PURE__ */ new Set(), this._openNotices = /* @__PURE__ */ new Set();
	}
	static {
		this.styles = Ae;
	}
	static {
		this.properties = {
			hass: { attribute: !1 },
			_config: { state: !0 },
			_now: { state: !0 },
			_expanded: { state: !0 },
			_openNotices: { state: !0 }
		};
	}
	static getConfigElement() {
		return document.createElement("bvg-connections-card-editor");
	}
	static getStubConfig(e) {
		let t = [], n = [];
		for (let r of Object.values(e.states)) {
			let e = r.attributes?.bvg_type;
			e === "connection" && t.push(r.entity_id), e === "departure_board" && n.push(r.entity_id);
		}
		return {
			type: "custom:bvg-connections-card",
			connections: t,
			departures: n
		};
	}
	setConfig(e) {
		if (!e) throw Error("Invalid configuration");
		let t = Se(e);
		if (!t.connections.length && !t.departures.length) throw Error("Add at least one entity under `connections` or `departures`.");
		this._config = t;
	}
	getCardSize() {
		let e = this._config;
		return e ? +!!e.show_header + e.connections.length * (1 + e.max_journeys) + Math.ceil(e.departures.length * (1 + e.max_departures) / 1.5) : 3;
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
		}, Ie);
	}
	disconnectedCallback() {
		super.disconnectedCallback(), this._timer && window.clearInterval(this._timer);
	}
	shouldUpdate(e) {
		if (!e.has("hass") || e.size > 1) return !0;
		let t = e.get("hass");
		return !t || !this._config || [...this._config.connections, ...this._config.departures].some((e) => t.states[e.entity] !== this.hass?.states[e.entity]);
	}
	get _lang() {
		return this.hass?.locale?.language ?? this.hass?.language ?? "de";
	}
	_t(e, t) {
		return ke(this._lang, e, t);
	}
	_time(e) {
		let t = typeof e == "number" ? e : X(e);
		if (t === null) return "–";
		let n = this.hass?.locale?.time_zone === "local" ? void 0 : this.hass?.config?.time_zone;
		return ve(t, this._lang, n);
	}
	render() {
		if (!this._config || !this.hass) return z;
		let e = this._config, t = [...e.connections, ...e.departures].map((e) => this.hass.states[e.entity]).filter(Boolean), n = e.connections.length ? this.hass.states[e.connections[0].entity] : void 0, r = e.title ?? (e.connections.length === 1 && n ? String(n.attributes.origin ?? "") : "");
		return L`
      <ha-card class=${this.hass.themes?.darkMode ? "dark" : ""}>
        ${e.show_header && (r || e.show_clock) ? L`<div class="header">
              <div class="title">${r}</div>
              ${e.show_clock ? L`<div class="clock">${this._time(this._now)}</div>` : z}
            </div>` : z}
        ${e.connections.map((e) => this._renderConnection(e))}
        ${e.departures.map((e) => this._renderBoard(e))}
        ${e.show_footer ? this._renderFooter(t) : z}
      </ha-card>
    `;
	}
	_entity(e, t) {
		let n = this.hass.states[e.entity];
		return n ? n.attributes.bvg_type === t ? n : L`<section><div class="warning">${e.entity}: ${this._t("wrong_entity")}</div></section>` : L`<section><div class="warning">${this._t("not_found")}: ${e.entity}</div></section>`;
	}
	_renderConnection(e) {
		let t = this._entity(e, "connection");
		if (!("attributes" in t)) return t;
		let n = t.attributes, r = Number(n.walk_minutes ?? 0), i = xe(n.journeys ?? [], this._now, this._config.max_journeys);
		return L`
      <section>
        <div class="group-head">
          ${this._sym("mdi:map-marker", "place", "l")}
          <span class="place">${e.name ?? n.origin}</span>
          ${e.name ? z : L`<ha-icon icon="mdi:arrow-right"></ha-icon><span class="place">${n.destination}</span>`}
          <span class="spacer"></span>
          ${n.stale ? L`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>` : z}
          ${r ? L`<span class="chip" title=${this._t("walk_to_stop")}
                >${this._sym("mdi:walk", "walk", "s")}${r} ${this._t("min")}</span
              >` : z}
        </div>
        ${i.length ? i.map((e, n) => this._renderJourney(t.entity_id, e, n, r)) : L`<div class="empty">${this._t("no_journeys")}</div>`}
      </section>
    `;
	}
	_renderJourney(e, t, n, r) {
		let i = `${e}:${t.departure}:${t.lines.join(">")}`, a = X(t.departure), o = X(t.leave_at), s = t.status === "cancelled", c = ye(r ? o : a, this._now, s), l = this._config.expand || this._expanded.has(i), u = Z(a, this._now, this._t("now")), d = Q(t.delay), f = Q(t.arrival_delay), p = t.legs.find((e) => !e.walking);
		return L`
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
        <div class="times">
          <span class="dep ${s ? "cancelled-text" : d ? this._delayClass(t.delay) : ""}"
            >${this._time(t.departure)}</span
          >
          ${d && t.planned_departure && !s ? L`<span class="planned">${this._time(t.planned_departure)}</span>` : z}
        </div>
        <div class="main">
          <div class="chain">
            ${t.starts_with_walk ? this._sym("mdi:walk", "walk") : z}
            ${t.legs.filter((e) => !e.walking).map((e, n) => L`${n || t.starts_with_walk ? L`<span class="sep">›</span>` : z}${this._badge(e.line, e.product, e.color, e.text_color, e.cancelled)}`)}
          </div>
          <div class="meta">
            <span class="arr ${s ? "cancelled-text" : ""}"
              >${this._t("arrival")} ${this._time(t.arrival)}${f ? L` <span class=${this._delayClass(t.arrival_delay)}>(${f})</span>` : z}</span
            >
            ${t.duration === null ? z : L`<span>${t.duration} ${this._t("min")}</span>`}
            <span>${this._transfers(t.transfers)}</span>
            ${p?.platform ? L`<span class=${p.platform_changed ? "platform-changed" : ""}
                  >${this._platform(p.platform)}</span
                >` : z}
            ${t.remarks.some((e) => e.type === "warning") ? this._sym("mdi:alert", "warn", "xs") : z}
          </div>
        </div>
        <div class="right">
          ${this._status(t)}
          <span class="countdown">${u.value}${u.unit ? L`<span class="unit">${this._t("min")}</span>` : z}</span>
          ${r && !s ? this._leaveHint(o, c) : z}
        </div>
      </div>
      ${l ? this._renderDetails(t) : z}
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
		}, n = e.status === "delayed" ? Q(e.delay) ?? Q(e.arrival_delay) ?? "+" : t[e.status];
		return this._tag(e.status, n);
	}
	_tag(e, t) {
		let [n, r] = Fe[e] ?? Fe.no_realtime;
		return L`<span class="status tone-${r}">${this._sym(n, r, "s")}${t}</span>`;
	}
	_sym(e, t, n = "m") {
		return L`<span class="sym ${n} tone-${t}"><ha-icon icon=${e}></ha-icon></span>`;
	}
	_productSym(e, t = "m") {
		let { icon: n, tone: r } = Te(e);
		return this._sym(n, r, t);
	}
	_leaveHint(e, t) {
		if (e === null) return z;
		let n = Math.floor((e - this._now) / 6e4), r;
		return r = t === "missed" ? this._t("missed") : n <= 0 ? this._t("leave_now") : this._t("leave_in", { m: n }), L`<span class="leave">${this._sym("mdi:walk", t === "relaxed" ? "walk" : "current", "s")}${r}</span>`;
	}
	_badge(e, t, n, r, i = !1, a = !1) {
		let o = n || "#5f6368", s = r || Ee(o);
		return L`<span
      class="badge ${Ce(t)} ${i ? "cancelled" : ""} ${a ? "large" : ""}"
      style="background:${o};color:${s}"
      >${e ?? "?"}</span
    >`;
	}
	_renderDetails(e) {
		return L`<div class="details">
      ${e.legs.map((e) => e.walking ? this._renderWalk(e) : this._renderLeg(e))}
      ${e.remarks.filter((t) => !e.legs.some((e) => e.remarks.some((e) => e.text === t.text))).map((e) => this._remark(e))}
    </div>`;
	}
	_renderWalk(e) {
		let t = e.departure && e.arrival ? Math.max(1, Math.round((Date.parse(e.arrival) - Date.parse(e.departure)) / 6e4)) : null, n = e.distance ? this._t("walk_distance", { d: e.distance }) : this._t("transfer");
		return L`<div class="leg walk">
      <span class="t">${this._time(e.departure)}</span>
      ${e.distance ? this._sym("mdi:walk", "walk") : this._sym("mdi:transit-transfer", "muted")}
      <span>${n}${t ? ` · ${t} ${this._t("min")}` : ""}${e.to ? ` → ${e.to}` : ""}</span>
    </div>`;
	}
	_renderLeg(e) {
		let t = Q(e.departure_delay), n = Q(e.arrival_delay);
		return L`<div class="leg">
      <span class="t">
        <span class=${e.cancelled ? "cancelled-text" : this._delayClass(e.departure_delay)}
          >${this._time(e.departure)}${t ? L` <small>${t}</small>` : z}</span
        >
        <span class=${e.cancelled ? "cancelled-text" : this._delayClass(e.arrival_delay)}
          >${this._time(e.arrival)}${n ? L` <small>${n}</small>` : z}</span
        >
      </span>
      <span class="line">
        ${this._productSym(e.product)}${this._badge(e.line, e.product, e.color, e.text_color, e.cancelled)}
      </span>
      <div class="route">
        <div class="stop ${e.cancelled ? "cancelled-text" : ""}">${e.from}</div>
        <div class="sub">
          ${e.direction ? L`<span>${this._t("direction")} ${e.direction}</span>` : z}
          ${e.platform ? L`<span class=${e.platform_changed ? "platform-changed" : ""}>${this._platform(e.platform)}</span>` : z}
          ${this._occupancy(e.occupancy)}
          ${e.cancelled ? this._tag("cancelled", this._t("cancelled")) : z}
          ${!e.reachable && !e.cancelled ? this._tag("connection_at_risk", this._t("at_risk")) : z}
        </div>
        <div class="stop ${e.cancelled ? "cancelled-text" : ""}">${e.to}</div>
        ${e.remarks.map((e) => this._remark(e))}
      </div>
    </div>`;
	}
	_occupancy(e) {
		if (!e) return z;
		let t = e === "high" ? "mdi:account-group" : e === "medium" ? "mdi:account-multiple" : "mdi:account";
		return L`<span class="occupancy ${e}" title=${this._t(`occupancy_${e}`)}><ha-icon icon=${t}></ha-icon></span>`;
	}
	_remark(e) {
		return L`<div class="remark is-${e.type}">
      ${e.type === "warning" ? this._sym("mdi:alert", "warn", "s") : this._sym("mdi:information-variant", "muted", "s")}
      <span>${e.summary && e.summary !== e.text ? L`<b>${e.summary}:</b> ` : z}${e.text}</span>
    </div>`;
	}
	_renderBoard(e) {
		let t = this._entity(e, "departure_board");
		if (!("attributes" in t)) return t;
		let n = t.attributes, r = Number(n.walk_minutes ?? 0), i = (n.departures ?? []).filter((e) => !be(X(e.when), this._now)).slice(0, this._config.max_departures), a = this._boardNotices(i), o = this._openNotices.has(t.entity_id);
		return L`
      <section>
        <div class="group-head">
          ${this._sym("mdi:bus-stop", "place", "l")}
          <span class="place">${e.name ?? n.stop}</span>
          <span class="spacer"></span>
          ${n.stale ? L`<span class="chip stale">${this._sym("mdi:cloud-alert", "warn", "s")}${this._t("stale")}</span>` : z}
          ${r ? L`<span class="chip">${this._sym("mdi:walk", "walk", "s")}${r} ${this._t("min")}</span>` : z}
        </div>
        ${i.length ? i.map((e) => this._renderDeparture(e, r)) : L`<div class="empty">${this._t("no_departures")}</div>`}
        ${a.length ? L`<div class="notices" @click=${() => this._toggleNotices(t.entity_id)}>
              <div class="summary">
                ${this._sym("mdi:alert", "warn", "s")}
                <span>${a.length === 1 ? this._t("remark") : this._t("remarks", { n: a.length })}</span>
                ${o ? z : L`<span class="preview">${a[0].text}</span>`}
                <span class="spacer"></span>
                <ha-icon icon=${o ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
              </div>
              ${o ? a.map((e) => this._remark(e)) : z}
            </div>` : z}
      </section>
    `;
	}
	_boardNotices(e) {
		let t = /* @__PURE__ */ new Set(), n = [];
		for (let r of e) for (let e of r.remarks) e.type === "warning" && !t.has(e.text) && (t.add(e.text), n.push(e));
		return n;
	}
	_renderDeparture(e, t) {
		let n = X(e.when), r = X(e.leave_at), i = !t || r === null || r >= this._now - 3e4, a = Z(n, this._now, this._t("now")), o = Q(e.delay), s = o && e.planned_when && !e.cancelled ? this._time(e.planned_when) : null;
		return L`<div class="departure ${e.cancelled ? "is-cancelled" : ""} ${i ? "" : "unreachable"}">
      ${this._productSym(e.product)}
      ${this._badge(e.line, e.product, e.color, e.text_color, !1, !0)}
      <div class="dir">
        <span>${e.direction}</span>
        ${e.platform || s || e.cancelled ? L`<small>
              ${e.cancelled ? this._tag("cancelled", this._t("cancelled")) : z}
              ${s ? L`<span class="planned-inline">${s}</span>` : z}
              ${e.platform ? L`<span class=${e.platform_changed ? "platform-changed" : ""}>${this._platform(e.platform)}</span>` : z}
            </small>` : z}
      </div>
      <span class="delay ${this._delayClass(e.delay)}"
        >${e.cancelled ? "" : L`${(e.delay ?? 0) > 0 ? this._sym("mdi:clock-alert-outline", "current", "xs") : z}${o ?? ""}`}</span
      >
      <span class="countdown ${e.cancelled ? "cancelled-text" : ""}"
        >${a.value}${a.unit ? L`<span class="unit">${this._t("min")}</span>` : z}</span
      >
    </div>`;
	}
	_renderFooter(e) {
		let t = e.map((e) => X(e.attributes.fetched_at)).filter((e) => e !== null);
		return t.length ? L`<div class="footer">
      ${e.some((e) => e.attributes.stale) ? L`<span class="stale-text">${this._t("stale")} ·</span>` : z}
      <span>${this._t("updated")} ${this._time(Math.min(...t))}</span>
    </div>` : z;
	}
	_toggle(e) {
		let t = new Set(this._expanded);
		t.has(e) ? t.delete(e) : t.add(e), this._expanded = t;
	}
	_toggleNotices(e) {
		let t = new Set(this._openNotices);
		t.has(e) ? t.delete(e) : t.add(e), this._openNotices = t;
	}
};
if (!customElements.get("bvg-connections-card")) {
	customElements.define("bvg-connections-card", Le);
	let e = window;
	e.customCards = e.customCards ?? [], e.customCards.push({
		type: "bvg-connections-card",
		name: "BVG Verbindungen",
		description: "Verbindungen mit Umstiegen, Abfahrtstafeln und Losgeh-Hinweisen",
		preview: !0,
		documentationURL: "https://github.com/MaxDeavy/ha-bvg-connections"
	}), console.info(`%c BVG-CONNECTIONS-CARD %c ${Pe} `, "color:#fff;background:#f0d722;color:#000;font-weight:700", "");
}
export { Le as BvgConnectionsCard };
