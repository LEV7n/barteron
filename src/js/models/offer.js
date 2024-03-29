import Vue from "vue";

/**
 * Offer object model
 * 
 * @class Offer
 */
class Offer {
	/**
	 * Initialize model
	 * 
	 * @constructor Offer
	 * @param {Object} data
	 */
	constructor(data) {
		/* Extract JSON values and format object */
		const
			{ t, a, c } = JSON.parse(data?.p?.s4 || '{"t":"","a":[],"c":"new"}'),
			images = JSON.parse(data?.p?.s5 || "[]");
		
		/* Iterable properties */
		this.address = data?.address || data?.s1 || "";
		this.hash = data?.s2 || data?.hash || null;
		this.firsthash = data?.s2 && data?.hash ? data.hash : null;
		this.language = data?.language || data?.p?.s1 || "";
		this.caption = data?.caption || data?.p?.s2 || "";
		this.description = data?.description || data?.p?.s3 || "";
		this.tag = data?.tag || t || null;
		this.tags = (data?.tags || a || []).map(tag => !isNaN(+tag) ? +tag : tag);
		this.condition = data?.condition || c || "new";
		this.images = data?.images || images;
		this.geohash = data?.geohash || data?.p?.s6 || "";
		this.price = (data?.price || data?.p?.i1 / 100 || 0);

		const
			isMs = (timestamp) => {
				const date = new Date(timestamp);
				return isNaN(date) || Math.abs(Date.now() - date) < Math.abs(Date.now() - date * 1000);
			},
			time = isMs(data?.time) ? +new Date : data?.time * 1000,
			date = new Date(time),
			till = data?.till || date.setMonth(date.getMonth() + 1);

		/* Hidden properties */
		Object.defineProperties(this, {
			sdk: { value: Vue.prototype.sdk },
			time: { value: time },
			till: { value: till },
			active: {
				value: (() => {
					let state = true;

					if (
						!this.hash ||
						till < +new Date
					) state = false;

					return state;
				})()
			},
			status: {
				value: (() => {
					const state = [];

					state.unshift("valid");
					if (!this.hash) state.unshift("draft");
					if (till < +new Date) state.unshift("outdated");

					return state.shift();
				})()
			}
		});

		Vue.set(
			this.sdk.barteron._offers,
			this.hash || "draft",
			this.update({ hash: this.hash || "draft" })
		);
	}

	/**
	 * Update model properties
	 * 
	 * @param {Object} [data]
	 * 
	 * @returns {Offer}
	 */
	update(data) {
		if (Object.keys(data || {}).length) {
			/* Iterate given props */
			for (const p in data) {
				this[p] = data[p];
			}
		}

		return this;
	}

	/**
	 * Store model data
	 * 
	 * @param {Object} data
	 */
	set(data) {
		return this.sdk.setBrtOffer({
			...this.update(data),
			price: parseInt(this.price * 100)
		}).then(data => {
			const
				txid = (this.hash?.length === 64 ? this.hash : data.transaction),
				hash = this.hash;

			/* Create new key in storage when hash had changed */
			if (txid && hash && txid !== hash) {
				this.update({ hash: txid });

				Vue.set(this.sdk.barteron._offers, txid, this);
				Vue.delete(this.sdk.barteron._offers, hash);
			}

			return data;
		});
	}

	/**
	 * Destroy model data
	 */
	destroy() {
		Vue.delete(this.sdk.barteron._offers, this.hash);
	}
};

export default Offer;