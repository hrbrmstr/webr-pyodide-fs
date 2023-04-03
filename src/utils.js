export const isProxy = (obj) => {
	try {
		const { proxy: testProxy } = Proxy.revocable(obj, {});
		return testProxy !== obj;
	} catch (err) {
		return false;
	}
}