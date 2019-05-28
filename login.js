async function show_username() {
	let username_label = document.getElementById("username_label")
	let info_view = document.getElementById("account_info")
	let login_button = document.getElementById("login_button")
	logged_in = account !== undefined

	if (account !== undefined) {
		username_label.innerHTML = `<a href="${block_explorer}/account/${account.name}">${account.name}</a>`
		info_view.hidden = false
		login_button.innerHTML = "Log out"
		await show_balance()
	}
	else {
		username_label.innerHTML = ""
		info_view.hidden = true
		login_button.innerHTML = "Log in"
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
	fund_label.innerHTML = `<span data-toggle="tooltip" title="Approximate worth of your deposited funds\nActual amount is: ${fundbalance}">FUND: ${eos_funds}</span>`

	var buckbalance = asset(0, "BUCK")
	if (balance !== undefined) {
		buckbalance = balance.balance
	}

	let total_buck = buckbalance
	buck_balance_label.innerHTML = `<span data-toggle="tooltip" title="Your personal $BUCK balance">BALANCE: ${total_buck}</span>`

	if (savings > 0) {
		let savings_buck = asset(savings * (await savings_price()), "BUCK")
		top_savings_balance.innerHTML = `<span data-toggle="tooltip" title="Approximate amount of $BUCK you have in savings">SAVINGS: ${savings_buck}</span>`
		top_savings_balance.hidden = false
	}
}

async function show_price() {
	let stat = await db.stat()
	if (stat === undefined) return
	let price_label = document.getElementById("top_eos_price")
	price_label.innerHTML = `<span data-toggle="tooltip" title="Current Oracle's EOS price\nUpdated at ${date(stat.oracle_timestamp)}">$${(await price()) / 100}</span>`
}

function setup_user() {
	if (ScatterJS.scatter.identity !== null && ScatterJS.scatter.identity !== false) {
		account = ScatterJS.scatter.identity.accounts.find(x => x.blockchain === 'eos')
		db.set_account(account)
		db.invalidate()
	}
	show_username()
	reload_page()
}

function login() {
	if (logged_in) {
		ScatterJS.forgetIdentity()
		account = undefined
		logged_in = false
		reload_page()
	}
	else {
		alert("Awaiting Scatter response…", "primary")
		ScatterJS.login().then(identity => {
			setup_user()
			alert(`Logged in as <b>${identity.accounts.find(x => x.blockchain === 'eos').name }</b>`, "success", ALERT.medium)
		})
		.catch(error => { 
			alert(error.message, "warning")
			reload_page()
		})
	}
}