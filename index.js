// Make actions

async function prepare_changeicr() {
	let id = document.getElementById('change_cdp_id').innerHTML
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let icr_field = document.getElementById("change_icr_field")
	let icr = parseInt(icr_field.value)
	if (isNaN(icr)) { alert("Incorrect input", "danger"); return }

	if (icr > 0 && icr < CONST.CR) { alert(`ICR can not be less than ${CONST.CR}%`, "warning"); return }
	if (icr > CONST.MAX_ICR) { alert(`ICR can not be higher than ${CONST.MAX_ICR}%`, "warning"); return }

	run_changeicr(id, icr)
}

async function prepare_remove_debt() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let id = document.getElementById('change_cdp_id').innerHTML

	// to-do validate

	run_remove_debt(id)
}

async function prepare_exchange_cancel() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let exchange_result = await getTable(TABLE.exchange, ACCOUNT.main, ACCOUNT.main, account.name, '1', 'i64', 1)
	let found = exchange_result !== undefined && exchange_result.rows.length > 0
	if (!found) { alert("You don't have an exchange order up", "warning", ALERT.medium); return }

	// to-do validate

	run_exchange_cancel(exchange.quantity)
}

async function prepare_change() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let id = document.getElementById('change_cdp_id').innerHTML

	var col_input = document.getElementById("change_collateral_field").value
	if (col_input === "") { col_input = 0 }
	var debt_input = document.getElementById("change_debt_field").value
	if (debt_input === "") { debt_input = 0 }
	let change_d = parseFloat(debt_input)
	let change_c = parseFloat(col_input)
	if (isNaN(change_d) || isNaN(change_c)) { alert("Incorrect input", "danger"); return }

	let change_collateral = asset(await convert(change_c, true), "REX")
	let change_debt = asset(change_d, "BUCK")

	// to-do validate

	run_change(id, change_collateral, change_debt)
}

async function prepare_close(id) {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }

	// to-do validate

	if (await modal("Are you sure to close this CDP?")) run_close(id)
}

async function prepare_exchange(id) {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let to_buck = id !== "exchange-buck-field"
	let value = parseFloat(document.getElementById(id).value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let symbol = to_buck ? "EOS" : "BUCK"
	let quantity = asset(value, symbol)

	// to-do validate

	run_exchange(quantity)
}

async function prepare_deposit_exchange() {
	let input = document.getElementById('exchange-deposit-field').value
	let value = parseFloat(input)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(value, "EOS")

	// to-do validate

	run_deposit_exchange(quantity)
}

async function prepare_savings(save) {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let save_field = document.getElementById("save_field")
	let unsave_field = document.getElementById("unsave_field")
	var quantity = asset((save ? save_field : unsave_field).value, "BUCK")

	if (!save) {
		quantity = Math.floor(amount(quantity) / (await savings_price()))
	}

	// to-do validate

	run_save(quantity, save)
}

async function prepare_transfer() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let quantity_field = document.getElementById("transfer_quantity_field")
	let memo_field = document.getElementById("transfer_memo_field")
	let to_field = document.getElementById("transfer_to_field")

	let quantity = asset(quantity_field.value, "BUCK")
	let memo = memo_field.value
	let to = to_field.value

	// to-do validate

	run_transfer(to, quantity, memo)
}

async function prepare_deposit(id) {

	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let value = parseFloat(document.getElementById(id).value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(value, "EOS")

	// to-do validate

	run_deposit(quantity, id.includes("exchange"))
}

async function prepare_withdraw() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let value = parseFloat(document.getElementById("withdraw-field").value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(await convert(value, true), "REX")

	// to-do validate

	run_withdraw(quantity, false)
}

async function prepare_withdraw_exchange() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let fund = await db.fund()
	if (fund === undefined) return
	if (amount(fund.exchange_balance) == 0) { alert("Exchange fund is empty", "warning", ALERT.medium); return }

	// to-do validate

	run_withdraw(fund.exchange_balance, true)
}

async function prepare_open() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }

	var dcr_input = document.getElementById("open_dcr_field").value
	if (dcr_input === "") { dcr_input = 0 }
	var icr_input = document.getElementById("open_icr_field").value
	if (icr_input === "") { icr_input = 0 }
	let dcr = parseInt(dcr_input)
	let icr = parseInt(icr_input)
	let collateral = fixed(parseFloat(document.getElementById("open_collateral_field").value))
	if (isNaN(icr) || isNaN(dcr) || isNaN(collateral)) { alert("Incorrect input", "warning"); return }

	let quantity = asset(await convert(collateral, true), "REX")

	if (dcr === 0 && icr === 0) { alert("DCR and ICR can't be both 0", "warning"); return }
	if (icr !== 0 && icr < CONST.CR) { alert("ICR can not be less than 150%", "warning"); return }
	if (icr > CONST.MAX_ICR || icr > CONST.MAX_ICR) { alert("ICR or DCR too high", "warning"); return }
	if (dcr < CONST.CR && dcr !== 0) { alert("DCR can not be less than 150%", "warning"); return }
	if (collateral < CONST.MIN_COLLATERAL) { alert("Minimum collateral is 5 EOS", "warning"); return }

	if (dcr > 0) {
		let debt = ((await price()) * collateral / dcr)
		if (debt < CONST.MIN_DEBT) { alert("Not enough debt. Trying to add: ~ " + asset(debt, "BUCK"), "secondary"); return }
	}

	let fund = await db.fund()
	if (fund !== undefined) {
		let deposited = fund.balance
		if (amount(quantity) >= amount(deposited)) {
			alert("Not enough deposited funds", "warning")
			return
		}
	}

	let success = await run_open(quantity, dcr, icr)
	if (success) { window.location.href = '/buck/#cdps'; }
}

// Load View

async function reload_cdps() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning", ALERT.short); return }
	let table = document.getElementById("cdps_table")
	table.innerHTML = ""

	let cdps_result = await getTable(TABLE.cdp, ACCOUNT.main, ACCOUNT.main, account.name, '5', 'i64', 100)
	if (cdps_result === undefined) return

	let label = document.getElementById("my_cdp_nope")
	label.hidden = cdps_result.rows.length != 0
	if (cdps_result.rows.length == 0) {
		table.innerHTML = ""
		return
	}

	var rows = ""
	var i = 0
	while (cdps_result.rows.length > i) {
		rows += await cdp_view(cdps_result.rows[i])
		i++
	}

	var total_debt = 0
	var total_collateral = 0
	cdps_result.rows.forEach(cdp => {
		total_debt += amount(cdp.debt)
		total_collateral += amount(cdp.collateral)
	})

	table.innerHTML += rows
}

async function reload_information() {
	let stats = await db.stat()
	let funds = await db.fund()
	let balance = await db.balance()
	let eos = await db.eos()

	let table = document.getElementById("info_table_body")
	table.innerHTML = ""
	var rows = ""

	rows += row(["Total $BUCK supply", stats.supply])
	rows += row(["Current EOS price", "$" + parseFloat(stats.oracle_eos_price) / 100])
	rows += row(["Price updated", date(stats.oracle_timestamp)])
	rows += empty_row

	if (account !== undefined) {
		let price = await savings_price()
		var deposited = asset(0, "EOS")
		var matured = asset(0, "EOS")
		var savings = asset(0, "BUCK")
		var buck_balance = asset(0, "BUCK")
		var eos_balance = asset(0, "EOS")

		var maturities = []

		if (funds !== undefined) {
			deposited = asset(await convert(amount(funds.balance)), "EOS")

			var matured_eos = await convert(funds.matured_rex / 10000)
			var unprocessed_matured_eos = 0

			for (i in funds.rex_maturities) {
				let maturity = funds.rex_maturities[i]
				let eos_amount = await convert(maturity.second / 10000, false)

				if (time(maturity.first) < now()) {
					unprocessed_matured_eos += eos_amount
				}
				else {
					let maturity_date = date(maturity.first, "d MMM")
					maturities.push(`+${ asset(eos_amount, "EOS") } on ${maturity_date}`)
				}
			}
			maturities = maturities.join("\n")

			matured = asset(matured_eos + unprocessed_matured_eos, "EOS")
			savings = asset(funds.savings_balance * price, "BUCK")
		}
		if (balance !== undefined) {
			buck_balance = balance.balance
		}
		if (eos !== undefined) {
			eos_balance = eos.balance
		}

		rows += row(["Personal EOS balance", eos.balance])
		rows += row(["Deposited funds", `<span data-toggle="tooltip" title="Maturities:\n${maturities}">${deposited} (${matured} matured)</span>`])
		rows += empty_row
		rows += row(["Personal balance", buck_balance])
		rows += row(["Savings amount", savings])
		$(function () {$('[data-toggle="tooltip"]').tooltip()})
	}
	else {

	}

	table.innerHTML += rows
}

async function reload_funds() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let balance = await db.eos()
	let funds = await db.fund()

	var fundbalance = asset(0, "REX")
	var fundmatured = 0
	if (funds !== undefined) {
		fundbalance = funds.balance
		fundmatured = funds.matured_rex
	}

	var buckbalance = asset(0, "EOS")
	if (balance !== undefined) {
		buckbalance = balance.balance
	}

	let eos_balance = document.getElementById('funds_eos_balance')
	let rex_matured_balance = document.getElementById('funds_rex_balance')

	eos_balance.innerHTML = `You have ${buckbalance} on your personal balance available to deposit`

	let eos = asset(await convert(fundmatured / 10000, false), "EOS")
	let rex = asset(fundmatured / 10000, "REX")
	rex_matured_balance.innerHTML = `You have ${eos} worth of matured funds available to withdraw` // (${rex})`
}

async function reload_exchange() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let balance = await db.balance()
	let funds = await db.fund()
	let eos = await db.eos()

	let buck_balance = document.getElementById("exchange_buck_balance")
	let eos_balance = document.getElementById("exchange_eos_balance")
	let ex_funds_balance = document.getElementById("exchange_fund_balance")

	if (balance === undefined) {
		buck_balance.innerHTML = `You have ${asset(0, "BUCK")} on your personal balance`
	}
	else {
		buck_balance.innerHTML = `You have ${balance.balance} on your personal balance`
	}

	if (eos_balance === undefined) {
		eos_balance.innerHTML = `You have ${asset(0, "EOS")} on your personal balance`
	}
	else {
		eos_balance.innerHTML = `You have ${eos.balance} on your personal balance`	
	}

	if (funds === undefined) return

	document.getElementById('withdraw_exchange_funds_container').hidden = amount(funds.exchange_balance) == 0
	ex_funds_balance.innerHTML = `You have ${funds.exchange_balance} to withdraw`

	let order_container = document.getElementById('exchange_order_container')
	let order_label = document.getElementById('exchange_order_label')

	let exchange_result = await getTable(TABLE.exchange, ACCOUNT.main, ACCOUNT.main, account.name, '1', 'i64', 1)
	let found = exchange_result !== undefined && exchange_result.rows.length > 0
	order_container.hidden = !found
	if (found) {
		let exchange = exchange_result.rows[0]
		order_label.innerHTML = `You already have an exchange order<br/>placed for ${exchange.quantity}`
	}
}

async function reload_change(str_id) {
	let id = parseInt(str_id)
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let container = document.getElementById('change_cdp_container')
	let id_container = document.getElementById('change_cdp_id')
	container.innerHTML = ""

	if (isNaN(id)) {
		alert(`Incorrect value for id.`, "secondary", ALERT.short)
		return
	}

	let balance = await db.balance()
	let cdp_result = await getTable(TABLE.cdp, ACCOUNT.main, ACCOUNT.main, id, '1', 'i64', 1)
	if (cdp_result === undefined || cdp_result.rows.length == 0) {
		alert(`Unable to load CDP #${id}`, "danger", ALERT.medium)
		return
	}

	// to-do verify can change cdp

	let cdp = cdp_result.rows[0]
	container.innerHTML = await cdp_view(cdp, false)
	id_container.innerHTML = cdp.id

	let new_dcr_label = document.getElementById("change_new_dcr")
	let taxes = await calculate_tax(cdp, true)

	let handler = async () => {
		var change_collateral = parseFloat($("#change_collateral_field").val())
		var change_debt = parseFloat($("#change_debt_field").val())

		if (isNaN(change_collateral)) { change_collateral = 0 }
		if (isNaN(change_debt)) { change_debt = 0 }


		if (change_collateral === 0 && change_debt === 0) {
			new_dcr_label.hidden = true
			return
		}

		let new_cdp = Object.assign({}, cdp)
		new_cdp.collateral = asset(amount(new_cdp.collateral) + (await convert(change_collateral, true)) - taxes.collateral, "REX")
		new_cdp.debt = asset(amount(new_cdp.debt) + taxes.debt + change_debt, "BUCK")

		let new_dcr = await get_dcr(new_cdp)
		new_dcr_label.hidden = false

		if (new_dcr >= 150) {
			new_dcr_label.innerHTML = `New DCR: ~${new_dcr}%`
		}
		else {
			new_dcr_label.innerHTML = "New DCR is too low"
		}
	}

	$("#change_collateral_field").on(EVENT.input, handler)
	$("#change_debt_field").on(EVENT.input, handler)
}

async function reload_transfer() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let balance = await db.balance()
}

async function reload_savings() {
	if (account === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let balance = await db.balance()
	let tax = await db.tax()
	let funds = await db.fund()

	let buck_balance = document.getElementById("savings_buck_balance")
	let savings_balance = document.getElementById("savings_savings_balance")

	let price = await savings_price()
	let savings = asset(funds.savings_balance * price, "BUCK")

	savings_balance.innerHTML = `You have ${savings} in savings`

	if (balance === undefined) {
		buck_balance.innerHTML = `Your balance: ${asset(0, "BUCK")}`
	}
	else {
		buck_balance.innerHTML = `Your balance: ${balance.balance}`
	}
}

async function reload_open() {
	let handler = async () => {
		var dcr = $("#open_dcr_field").val()
		var icr = $("#open_icr_field").val()
		dcr = dcr == "" ? 0 : parseInt(dcr)
		let collateral = parseFloat($("#open_collateral_field").val())

		let buck_label = document.getElementById('open_bucks_container')
		let should_show = !isNaN(dcr) && !isNaN(collateral) && collateral !== undefined
		buck_label.hidden = false
		if (should_show) {
			if (dcr == 0) {
				if (icr > CONST.MAX_ICR) {
					buck_label.innerHTML = "Maximum ICR is 1000%"
				}
				else if (icr < CONST.CR) {
					buck_label.innerHTML = "Minimum ICR is 150%"
				}
				else {
					buck_label.innerHTML = `You will not receive $BUCK from this CDP`
				}
			}
			else {
				if (collateral < 5) {
					buck_label.innerHTML = `Minimum collateral is 5 EOS`
				}
				else if (dcr < CONST.CR) {
					buck_label.innerHTML = `Minimum DCR is 150%`
				}
				else if (dcr > CONST.MAX_ICR) {
					buck_label.innerHTML = `Maximum DCR is 1000%`
				}
				else {
					let buck = asset(collateral * (await price()) / dcr, "BUCK")
					buck_label.innerHTML = `You will receive ~${buck} and the same amount of debt`
				}
			}
		}
		else {
			buck_label.innerHTML = `Enter correct values to see how much $BUCK you will receive…`
		}
	}
	$("#open_icr_field").on(EVENT.input, handler)
	$("#open_dcr_field").on(EVENT.input, handler)
	$("#open_collateral_field").on(EVENT.input, handler)
}

function unsubscribe_events() {
	$("#open_dcr_field").off(EVENT.input)
	$("#open_icr_field").off(EVENT.input)
	$("#open_collateral_field").off(EVENT.input)
	$("#change_collateral_field").off(EVENT.input)
	$("#change_debt_field").off(EVENT.input)
}

async function reload_page(delay=0) {
	unsubscribe_events()

	if (delay !== 0) {
		await sleep(delay)
	}
	
	await db.rex()
	await db.stat()
	await db.tax()
	await db.fund()
	await db.balance()

	var page = "info"
	let id = undefined
	var split = window.location.href.split('#')
	var path = ""
	if (split.length >= 2) { 
		page = split[1]
		if (page.includes("-")) {
			id = page.split("-")[1]
			page = page.split("-")[0]
		}
	}

	if (account === undefined) { page = "info" }

	document.getElementById("info-container").hidden = page != "info"
	document.getElementById("cdps-container").hidden = page != "cdps"
	document.getElementById("open-container").hidden = page != "open"
	document.getElementById("funds-container").hidden = page != "funds"
	document.getElementById("savings-container").hidden = page != "savings"
	document.getElementById("transfer-container").hidden = page != "transfer"
	document.getElementById("exchange-container").hidden = page != "exchange"
	document.getElementById("change-container").hidden = page != "change"

	switch (page) {
		case "info": reload_information(); break
		case "cdps": reload_cdps(); break
		case "funds": reload_funds(); break
		case "savings": reload_savings(); break
		case "exchange": reload_exchange(); break
		case "change": reload_change(id); break
		case "transfer": reload_transfer(); break
		case "open": reload_open(); break
	}

	let logged_in_menu = document.getElementById('logged_in_actions')
	logged_in_menu.hidden = account === undefined

	show_username()
	menu_select(document.getElementById(page), false)
}

window.addEventListener('load', function() {
	var page = "info"
	var split = window.location.href.split('#')
	var path = ""
	if (split.length >= 2) { 
		page = split[1]
		if (page.includes("-")) { page = page.split("-")[0] }
	}
	menu_select(document.getElementById(page), false)
})