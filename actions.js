async function runTransaction(actions) {
	alert("Requesting signature…", "primary", ALERT.medium)
	try {
		if (!Array.isArray(actions)) { actions = [actions] }
		let tx = await auth.user.signTransaction({ actions: actions }, { broadcast: true })
		alert_transaction(tx)
		db.invalidate()
		reload_page(0.75)
		return true
	}
	catch (error) {
		alert_transaction_error(error)
		return false
	}
}

function configure(data, action, contract=ACCOUNT.main, permission_level="active") {
	return { account: contract, name: action, authorization: [{ actor: auth.accountName, permission: permission_level }], data: data }
}

function make_transfer(to, quantity, memo="", contract) {
	let data = { from: auth.accountName, to: to, quantity: quantity, memo: memo }
	return configure(data, ACTION.transfer, contract)
}

async function run_transfer(to, quantity, memo="", contract) {
	return runTransaction(make_transfer(to, quantity, memo, contract))
}

async function run_deposit_exchange(quantity) {
	let deposit = make_transfer(ACCOUNT.main, quantity, "exchange", ACCOUNT.token)
	let exchange = configure({ account: auth.accountName, quantity:quantity }, ACTION.exchange)
	return runTransaction([deposit, exchange])
}

async function run_redeem(quantity) {
	return runTransaction(configure({ account: auth.accountName, quantity: quantity }, ACTION.redeem))
}

async function run_deposit(quantity, exchange) {
	let memo = exchange ? "exchange" : "deposit"
	run_transfer(ACCOUNT.main, quantity, memo, ACCOUNT.token)
}

async function run_withdraw(quantity, exchange) {
	return runTransaction(configure({ account: auth.accountName, quantity:quantity }, ACTION.withdraw))
}

async function run_exchange_cancel() {
	return runTransaction(configure({ account: auth.accountName }, ACTION.cancelorder))
}

async function run_remove_debt(id) {
	return runTransaction(configure({ cdp_id: id }, ACTION.removedebt))
}

async function run_close(id) {
	return runTransaction(configure({ cdp_id:id }, ACTION.close))
}

async function run_exchange(quantity) {
	return runTransaction(configure({ account: auth.accountName, quantity:quantity }, ACTION.exchange))
}

async function run_changeicr(id, icr) {
	return runTransaction(configure({ cdp_id: id, icr: icr }, ACTION.changeicr))
}

async function run_change(id, collateral, debt) {
	let data = { cdp_id: id, change_collateral: collateral, change_debt: debt }
	return runTransaction(configure(data, ACTION.change))
}

async function run_save(quantity, save) {
	let action = save ? ACTION.save : ACTION.unsave
	let data = { account: auth.accountName, quantity:quantity }
	return runTransaction(configure(data, action))
}

async function run_open(collateral, dcr, icr) {
	let data = { dcr:dcr, icr:icr, quantity: collateral, account: auth.accountName }
	return runTransaction(configure(data, ACTION.open))
}
