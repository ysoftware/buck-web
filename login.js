function is_mobile() { return navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i) }

async function show_username() {
	let username_label = document.getElementById("username_label")
	let info_view = document.getElementById("account_info")
	let logout_button = document.getElementById("logout_button")
	logged_in = auth.accountName !== undefined

	logout_button.hidden = !logged_in || is_mobile()
	info_view.hidden = !logged_in

	if (logged_in) {
		username_label.innerHTML = `<a href="${block_explorer}/account/${auth.accountName}">${auth.accountName}</a>`
		await show_balance()
	}
	else {
		username_label.innerHTML = ""
	}
	await show_price()
	$(function () {$('[data-toggle="tooltip"]').tooltip()})
}

async function show_balance() {
	let fund_label = document.getElementById("top_fund_balance")
	let buck_balance_label = document.getElementById("top_buck_balance")

	let fund = await db.fund()
	let balance = await db.balance()
	let rex = await db.rex()
	let tax = await db.tax()

	var fundbalance = asset(0, "REX")
	var savings = 0
	if (fund !== undefined && fund !== null) {
		fundbalance = fund.balance
		savings = fund.savings_balance
	}

	let eos_funds = asset(await convert(amount(fundbalance), false), "EOS")
	fund_label.innerHTML = `<span data-toggle="tooltip" title="Approximate worth of your deposited funds\nActual amount is: ${fundbalance}">FUN ${eos_funds}</span>`

	var buckbalance = asset(0, "BUCK")
	if (balance !== undefined) {
		buckbalance = balance.balance
	}

	let total_buck = buckbalance
	buck_balance_label.innerHTML = `<span data-toggle="tooltip" title="Your personal $BUCK balance">BAL ${total_buck}</span>`

	let savings_buck = asset(savings * (await savings_price()), "BUCK")
	let savings_text = ""
	if (savings > 0) {
		savings_text = `<span data-toggle="tooltip" title="Approximate amount of $BUCK you have in savings">SAV ${savings_buck}</span>`
	}
	top_savings_balance.innerHTML = savings_text
	top_savings_balance.hidden = savings === 0
}

async function show_price() {
	let stat = await db.stat()
	if (stat === undefined) return
	let price_label = document.getElementById("top_eos_price")
	price_label.innerHTML = `<span data-toggle="tooltip" title="Current Oracle's EOS price\nUpdated at ${date(stat.oracle_timestamp)}">$${(await price()) / 100}</span>`
}

function view_account() {
	if (!auth.isLoggedIn) {
		let name = document.getElementById('view_account_field').value
		auth.isLoggedIn = false
		auth.accountName = name
		auth.user = undefined
		setup_user()
		init_page()
	}
}

function logout() {
	if (auth.user !== undefined) {
		auth.ual.logoutUser()
	}
	auth.isLoggedIn = false
	auth.accountName = undefined
	auth.user = undefined
	init_page()
}