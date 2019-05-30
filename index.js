// Make actions

async function prepare_redeem() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let value = document.getElementById('redeem_field').value
	let amount = parseFloat(value)
	if (isNaN(amount)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(value, "BUCK")

	// to-do validate
	
	if (amount < CONST.MIN_REDEMPTION) {
		alert(`Minimum amount to redeem is ${CONST.MIN_REDEMPTION} BUCK`, "warning"); return
	}

	run_redeem(quantity)
}

async function prepare_changeicr() {
	let id = document.getElementById('change_cdp_id').innerHTML
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let icr_field = document.getElementById("change_icr_field")
	let icr = parseInt(icr_field.value)
	if (isNaN(icr)) { alert("Incorrect input", "danger"); return }

	if (icr > 0 && icr < CONST.CR) { alert(`ICR can not be less than ${CONST.CR}%`, "warning"); return }
	if (icr > CONST.MAX_ICR) { alert(`ICR can not be higher than ${CONST.MAX_ICR}%`, "warning"); return }

	run_changeicr(id, icr)
}

async function prepare_remove_debt() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let id = document.getElementById('change_cdp_id').innerHTML

	// to-do validate

	run_remove_debt(id)
}

async function prepare_exchange_cancel() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	
	// to-do validate

	run_exchange_cancel(exchange.quantity)
}

async function prepare_change() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let id = document.getElementById('change_cdp_id').innerHTML

	let fund = await db.fund()

	var col_input = document.getElementById("change_collateral_field").value
	if (col_input === "") { col_input = 0 }
	var debt_input = document.getElementById("change_debt_field").value
	if (debt_input === "") { debt_input = 0 }
	let change_d = parseFloat(debt_input)
	let change_c = parseFloat(col_input)
	if (isNaN(change_d) || isNaN(change_c)) { alert("Incorrect input", "danger"); return }
	
	let change_debt = asset(change_d, "BUCK")

	var change_collateral;
	let deposited = fund.balance
	let deposited_eos = await convert(amount(deposited), false)
	if (change_c == deposited_eos) {
		change_collateral = deposited
	}
	else {
		change_collateral = asset(await convert(change_c, true), "REX")
	}

	// to-do validate

	run_change(id, change_collateral, change_debt)
}

async function prepare_close(id) {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }

	// to-do validate

	if (await modal("Please, note that minimum amount of 0.0001 of tax will be added to your debt when making a request to change CDP", "Are you sure to close this CDP?")) run_close(id)
}

async function prepare_exchange(id) {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let to_buck = id !== "exchange-buck-field"
	let value = parseFloat(document.getElementById(id).value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let symbol = to_buck ? "EOS" : "BUCK"
	let quantity = asset(value, symbol)

	if (symbol == "EOS" && amount(quantity) < CONST.MIN_EXCHANGE_EOS) {
		alert(`Minimum exchange amount is ${CONST.MIN_EXCHANGE_EOS} EOS`, "warning"); return
	}
	else if (symbol == "BUCK" && amount(quantity) < CONST.MIN_EXCHANGE_BUCK) {
		alert(`Minimum exchange amount is ${CONST.MIN_EXCHANGE_BUCK} $BUCK`, "warning"); return
	}

	// to-do validate top limit

	run_exchange(quantity)
}

async function prepare_deposit_exchange() {
	let input = document.getElementById('exchange-deposit-field').value
	let value = parseFloat(input)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(value, "EOS")

	if (amount(quantity) < CONST.MIN_EXCHANGE_EOS) {
		alert(`Minimum exchange amount is ${CONST.MIN_EXCHANGE_EOS} EOS`, "warning"); return
	}

	// to-do validate top limit

	run_deposit_exchange(quantity)
}

async function prepare_savings(save) {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let save_field = document.getElementById("save_field")
	let unsave_field = document.getElementById("unsave_field")
	var quantity = asset((save ? save_field : unsave_field).value, "BUCK")
	let price = await savings_price()


	if (!save) {
		let fund = await db.fund()
		let deposited_savings = fixed(fund.savings_balance * price)
		if (deposited_savings == amount(quantity)) {
			quantity = fund.savings_balance
		}
		else {
			quantity = Math.floor(amount(quantity) / price)
		}
	}
	else {
		if (amount(quantity) < CONST.MIN_SAVINGS) {
			alert(`Minimum amount to put in savings is ${CONST.MIN_SAVINGS} $BUCK`, "warning"); return
		}
	}

	// to-do validate

	run_save(quantity, save)
}

async function prepare_transfer() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
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

	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let value = parseFloat(document.getElementById(id).value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }
	let quantity = asset(value, "EOS")

	// to-do validate

	run_deposit(quantity, id.includes("exchange"))
}

async function prepare_withdraw() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let value = parseFloat(document.getElementById("withdraw-field").value)
	if (isNaN(value)) { alert("Incorrect input", "danger"); return }

	let fund = await db.fund()
	let deposited = fund.balance

	var quantity;
	let deposited_eos = await convert(amount(deposited), false)
	if (value == deposited_eos) {
		quantity = deposited
	}
	else {
		quantity = asset(await convert(value, true), "REX")
	}

	// to-do validate

	run_withdraw(quantity, false)
}

async function prepare_withdraw_exchange() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let fund = await db.fund()
	if (fund === undefined) return
	if (amount(fund.exchange_balance) == 0) { alert("Exchange fund is empty", "warning", ALERT.medium); return }

	// to-do validate

	run_withdraw(fund.exchange_balance, true)
}

async function prepare_open() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }

	var dcr_input = document.getElementById("open_dcr_field").value
	if (dcr_input === "") { dcr_input = 0 }
	var icr_input = document.getElementById("open_icr_field").value
	if (icr_input === "") { icr_input = 0 }
	let dcr = parseInt(dcr_input)
	let icr = parseInt(icr_input)
	let collateral = fixed(parseFloat(document.getElementById("open_collateral_field").value))
	if (isNaN(icr) || isNaN(dcr) || isNaN(collateral)) { alert("Incorrect input", "warning"); return }

	let fund = await db.fund()
	let deposited = fund.balance

	var quantity;
	let deposited_eos = await convert(amount(deposited), false)
	if (collateral == deposited_eos) {
		quantity = deposited
	}
	else {
		quantity = asset(await convert(collateral, true), "REX");
	}

	if (dcr === 0 && icr === 0) { alert("DCR and ICR can't be both 0", "warning"); return }
	if (icr !== 0 && icr < CONST.CR) { alert("ICR can not be less than 150%", "warning"); return }
	if (icr > CONST.MAX_ICR || icr > CONST.MAX_ICR) { alert("ICR or DCR too high", "warning"); return }
	if (dcr < CONST.CR && dcr !== 0) { alert("DCR can not be less than 150%", "warning"); return }
	if (collateral < CONST.MIN_COLLATERAL) { alert("Minimum collateral is 5 EOS", "warning"); return }

	if (dcr > 0) {
		let debt = ((await price()) * collateral / dcr)
		if (debt < CONST.MIN_DEBT) { alert("Minimum debt is 10 $BUCK. Trying to add: ~" + asset(debt, "BUCK"), "secondary"); return }
	}

	if (fund !== undefined) {
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
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let table = document.getElementById("cdps_table")
	table.innerHTML = ""

	let cdps = await db.cdps()

	let label = document.getElementById("my_cdp_nope")
	label.hidden = cdps.length != 0
	if (cdps.length == 0) {
		table.innerHTML = ""
		return
	}

	var rows = ""
	var i = 0
	while (cdps.length > i) {
		rows += await cdp_view(cdps[i])
		i++
	}

	var total_debt = 0
	var total_collateral = 0
	cdps.forEach(cdp => {
		total_debt += amount(cdp.debt)
		total_collateral += amount(cdp.collateral)
	})

	table.innerHTML = rows
}

async function reload_information() {
	let stats = await db.stat()
	let funds = await db.fund()
	let balance = await db.balance()
	let eos = await db.eos()

	let table = document.getElementById("info_table_body")
	table.innerHTML = ""
	var rows = ""

	if (stats !== undefined) {
		rows += row(["Total $BUCK supply", stats.supply])
		rows += row(["Current EOS price", "$" + parseFloat(stats.oracle_eos_price) / 100])
		rows += row(["Price updated", date(stats.oracle_timestamp)])
		rows += empty_row
	}
	else {
		// to-do try again?
		return
	}

	document.getElementById("login_panel").hidden = auth.accountName !== undefined
	
	if (auth.accountName !== undefined) {
		let price = await savings_price()
		var deposited = asset(0, "EOS")
		var matured = asset(0, "EOS")
		var savings = asset(0, "BUCK")

		var maturities = []

		if (eos !== undefined) {
			rows += row(["Personal EOS balance", eos.balance])
		}

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
			
			var maturities_tooltip = ""
			if (maturities.length > 0) {
				maturities_tooltip = ` data-toggle="tooltip" title="Maturities:\n${maturities.join("\n")}"`
			}
			
			matured = asset(matured_eos + unprocessed_matured_eos, "EOS")
			if (matured === deposited) { matured = "all" }

			savings = asset(funds.savings_balance * price, "BUCK")

			rows += row(["Deposited funds", `<span${maturities_tooltip}>${deposited} (${matured} matured)</span>`])
			rows += empty_row
			rows += row(["Savings amount", savings])
		}

		if (balance !== undefined) {
			rows += row(["Personal balance", balance.balance])
		}

		$(function () {$('[data-toggle="tooltip"]').tooltip()})

		if (balance === undefined && eos === undefined && funds === undefined) {
			alert("Unable to load data", "danger", ALERT.long)
		}
	}

	table.innerHTML = rows
}

async function reload_funds() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let eos_balance = document.getElementById('funds_eos_balance')
	let rex_matured_balance = document.getElementById('funds_rex_balance')

	let balance = await db.eos()
	let funds = await db.fund()

	var fundmatured = 0
	if (funds === undefined) {
		rex_matured_balance.innerHTML = "Balance not found"
	}
	else {

		var matured_eos = await convert(funds.matured_rex / 10000)
		var unprocessed_matured_eos = 0
		for (i in funds.rex_maturities) {
			let maturity = funds.rex_maturities[i]
			let eos_amount = await convert(maturity.second / 10000, false)

			if (time(maturity.first) < now()) {
				unprocessed_matured_eos += eos_amount
			}
		}

		let matured = asset(matured_eos + unprocessed_matured_eos, "EOS")
		rex_matured_balance.innerHTML = `You have ${matured} worth of matured funds available to withdraw`
	}

	var buckbalance = asset(0, "EOS")
	if (balance === undefined) {
		eos_balance.innerHTML = "Balance not found"
	}
	else {
		eos_balance.innerHTML = `You have ${balance.balance} on your personal balance available to deposit`
	}
}

async function reload_exchange() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let balance = await db.balance()
	let funds = await db.fund()
	let eos = await db.eos()

	let buck_balance = document.getElementById("exchange_buck_balance")
	let eos_balance = document.getElementById("exchange_eos_balance")
	let ex_funds_balance = document.getElementById("exchange_fund_balance")

	if (balance === undefined) {
		buck_balance.innerHTML = `Balance not found`
	}
	else {
		buck_balance.innerHTML = `You have ${balance.balance} on your personal balance`
	}

	if (eos === undefined) {
		eos_balance.innerHTML = `Balance not found`
	}
	else {
		eos_balance.innerHTML = `You have ${eos.balance} on your personal balance`	
	}

	if (funds === undefined) return

	document.getElementById('withdraw_exchange_funds_container').hidden = amount(funds.exchange_balance) == 0
	ex_funds_balance.innerHTML = `You have ${funds.exchange_balance} to withdraw`

	let order_container = document.getElementById('exchange_order_container')
	let order_label = document.getElementById('exchange_order_label')

	let order = await db.get_exchange_order()
	order_container.hidden = order === undefined
	if (order !== undefined) {
		order_label.innerHTML = `You already have an exchange order<br/>placed for ${order.quantity}`
	}
}

async function reload_change(str_id) {
	let id = parseInt(str_id)
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }

	let container = document.getElementById('change_cdp_container')
	let id_container = document.getElementById('change_cdp_id')
	container.innerHTML = ""

	if (isNaN(id)) {
		alert(`Incorrect value for id.`, "secondary")
		return
	}

	let balance = await db.balance()
	let cdp = await db.get_cdp(id)

	if (cdp === undefined) { alert(`Unable to load CDP #${id}`, "danger", ALERT.medium); return }

	// to-do verify can change cdp

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

		if (amount(new_cdp.debt) < CONST.MIN_DEBT && amount(new_cdp.debt) > 0) {
			new_dcr_label.innerHTML = "Minimum debt is 10 $BUCK"
		}
		else if ((await convert(amount(new_cdp.collateral), false)) < CONST.MIN_COLLATERAL) {
			new_dcr_label.innerHTML = "Minimum collateral is 5 EOS"
		}
		else if (amount(new_cdp.debt) == 0 && amount(cdp.debt) != 0) {
			new_dcr_label.innerHTML = "Removing all debt"
		}
		else if (new_dcr >= 150) {
			new_dcr_label.innerHTML = `New DCR: ~${new_dcr}%`
		}
		else if (!isNaN(new_dcr) && new_dcr > 0) {
			new_dcr_label.innerHTML = "New DCR is too low"
		}
		else {
			new_dcr_label.innerHTML = "Just adding collateral"
		}
	}

	$("#change_collateral_field").on(EVENT.input, handler)
	$("#change_debt_field").on(EVENT.input, handler)
}

async function reload_transfer() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let balance = await db.balance()
}

async function reload_savings() {
	if (auth.accountName === undefined) { alert("Please, log in with Scatter", "warning"); return }
	let balance = await db.balance()
	let tax = await db.tax()
	let funds = await db.fund()

	let buck_balance = document.getElementById("savings_buck_balance")
	let savings_balance = document.getElementById("savings_savings_balance")

	let price = await savings_price()

	if (funds === undefined) {
		savings_balance.innerHTML = "Balance not found"
	}
	else {
		let savings = asset(funds.savings_balance * price, "BUCK")
		savings_balance.innerHTML = `You have ${savings} in savings`
	}

	if (balance === undefined) {
		buck_balance.innerHTML = `Balance not found`
	}
	else {
		buck_balance.innerHTML = `Your balance: ${balance.balance}`
	}
}

async function reload_redeem() {	
	let balance = await db.balance()
	let buck_balance = document.getElementById("redeem_buck_balance")

	if (balance === undefined) {
		buck_balance.innerHTML = `Balance not found`
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
				if (collateral < 5) {
					buck_label.innerHTML = `Minimum collateral is 5 EOS`
				}
				else {
					buck_label.innerHTML = `You will not receive $BUCK from insurer CDP`
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
					if (dcr < 200) {
						buck_label.innerHTML += "<br/>Recommended DCR is above 200%"
					}
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
	if (delay !== 0) await sleep(delay)

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

	if (auth.accountName === undefined) { page = "info" }
		
	document.getElementById("info-container").hidden = page != "info"
	document.getElementById("cdps-container").hidden = page != "cdps"
	document.getElementById("open-container").hidden = page != "open"
	document.getElementById("funds-container").hidden = page != "funds"
	document.getElementById("savings-container").hidden = page != "savings"
	document.getElementById("transfer-container").hidden = page != "transfer"
	document.getElementById("exchange-container").hidden = page != "exchange"
	document.getElementById("change-container").hidden = page != "change"
	document.getElementById("redeem-container").hidden = page != "redeem"

	switch (page) {
		case "info": reload_information(); break
		case "cdps": reload_cdps(); break
		case "funds": reload_funds(); break
		case "savings": reload_savings(); break
		case "exchange": reload_exchange(); break
		case "change": reload_change(id); break
		case "transfer": reload_transfer(); break
		case "open": reload_open(); break
		case "redeem": reload_redeem(); break
	}

	let logged_in_menu = document.getElementById('logged_in_actions')
	logged_in_menu.hidden = auth.accountName === undefined

	show_username()
	menu_select(document.getElementById(page), false)
}

function init_page() {
	document.body.style.backgroundColor = COLOR.background

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
	if (auth.accountName === undefined) { page = "info" }

	reload_page()
	menu_select(document.getElementById(page), false)

	if (is_mobile()) {
		document.getElementById('top_bar').classList.remove('sticky-top')
		document.getElementById('bottom_bar').classList.remove('fixed-bottom')
	}
	else {
		$('#navbarTogglerDemo01').collapse('show')
		document.getElementById('sandwich_button').hidden = true
	}

	style_login_button()
}