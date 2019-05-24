async function getTable(table, contract=ACCOUNT.main, scope=undefined, value=undefined, index='1', type='i64', limit=10) {

	if (scope === undefined) { scope = contract }

	var lower = undefined
	var upper = undefined

	if (value !== undefined && typeof value == 'string') {
		let number = new BigNumber(Eos.modules.format.encodeName(value, false))
		lower = number.toString()
		upper = number.plus(1).toString()
	}
	else {
		upper = value
		lower = value
	}

	let config = { code: contract, json: true, scope: scope, table: table, lower_bound: lower, 
		upper_bound: upper, key_type: type, index_position: index, limit: limit }
	return await eos.getTableRows(config)
}

function is_insurer(cdp) {
	return cdp.icr > CONST.CR && amount(cdp.debt) < CONST.MIN_DEBT && amount(cdp.collateral) > CONST.MIN_INSURER_REX
}

function asset(amount, symbol="REX") {
	if (isNaN(parseFloat(amount))) return undefined
	return fixed(parseFloat(amount)) + " " + symbol 
}

function amount(asset) {
	if (asset === undefined || typeof asset != 'string') { 
		console.error("amount error", asset)
		return 0
	}
	if (!asset.includes(" ")) {
		console.error("can not get amount of asset", asset)
		return 0
	}
	return parseFloat(asset.split(" ")[0])
}