async function get_dcr(cdp) { return parseInt(await to_buck(amount(cdp.collateral)) / amount(cdp.debt)) }
async function to_buck(quantity) { return await convert(quantity * (await price()), false) }
async function to_rex(quantity, tax=0) { return await convert(quantity, true) / ((await price()) * (100 + tax) / 100) }

async function convert(quantity, to_rex) {
	let rexpool = await db.rex()
	if (rexpool === undefined) return undefined
	let R0 = amount(rexpool.total_rex)
	let S0 = amount(rexpool.total_lendable)
	if (to_rex) return fixed(quantity * R0 / S0)
	return fixed(quantity * S0 / R0)
}

async function calculate_tax(cdp, accrue_min=false) {
	if (amount(cdp.debt) == 0 ||
		(amount(cdp.debt) < CONST.MIN_DEBT && amount(cdp.collateral) > CONST.MIN_INSURER_REX)) {
		return { debt: 0, collateral: 0 }
	}
	console.log(cdp)

	let now_time = now()
	let last = cdp.modified_round
	let v = Math.exp(CONST.AR * (now_time - last) / CONST.YEAR) - 1
	let accrued_amount = amount(cdp.debt) * v

	let min = accrue_min ? 0.0001 : 0
	let accrued_debt = Math.max(min, accrued_amount * CONST.SR / 100)
	let accrued_collateral = Math.max(min, await to_rex(accrued_amount * CONST.IR))
	return { debt: accrued_debt, collateral: accrued_collateral }
}

function date(value, format="d MMM H:mm:ss") {
	return $.format.date(new Date(value), format)
}

function time(value) {
	return new Date(value).getTime() / 1000
}

function now() {
	return parseInt(new Date().getTime() / 1000)
}

function fixed(value, digits=4) {
	let pow = 10 ** digits
	return Math.floor(value * pow) / pow
}

function short(number, symbol="") {
	if (number >= 1000000) { return `${parseInt(number / 1000000)}M ${symbol}`.trim() }
	else if (number >= 1000) { return `${parseInt(number / 1000)}K ${symbol}`.trim() }
	return `${parseInt(number)} ${symbol}`.trim()
}