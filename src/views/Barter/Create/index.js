export default {
	name: "CreateBarter",

	computed: {
		offer() {
			return this.sdk.barteron.offers[this.$route.params.id];
		}
	}
}