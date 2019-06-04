/// setup

let TABLE = {
	rexpool: "rexpool", accounts: "accounts", stat: "stat", exchange: "exchange",
	fund: "fund", cdp: "cdp", taxation: "taxation", reparamreq: "reparamreq", closereq: "closereq"
}

let ACTION = {
	update: "update", run: "run", open: "open", withdraw: "withdraw", transfer: "transfer", 
	close: "close", changeicr: "changeicr", change: "change", save: "save", unsave: "unsave",
	exchange: "exchange", cancelorder: "cancelorder", removedebt: "removedebt", redeem: "redeem"
}

let ALERT = { short: 1500, medium: 2500, long: 3500 }

let CONST = {
	SR: 80, IR: 20, SP: 20, RF: 1, CR: 150, LF: 10, AR: 0.095,
	YEAR: 31557600, ACCRUAL_PERIOD: 1314900, 
	MIN_DEBT: 10, MIN_REDEMPTION: 10, MIN_COLLATERAL: 5, MIN_INSURER_REX: 150000.0000,
	MIN_EXCHANGE_EOS: 1, MIN_EXCHANGE_BUCK: 5, MIN_SAVINGS: 1,
	MAX_ICR: 1000
}

let ENDPOINT = {
	jungle: { blockchain: 'eos', chainId: 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473',
		host: 'jungle2.cryptolions.io', port: 443, protocol: 'https', explorer: "http://jungle.bloks.io" },

	main: { blockchain: 'eos', chainId: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
		host: 'eos.greymass.com', port: 443, protocol: 'https', explorer: "http://bloks.io" }
}

let EVENT = {
	input: 'change keydown keypress keyup mousedown click mouseup'
}

let ACCOUNT = {
	main:"buckprotocol", eosio: "eosio", token: "eosio.token"
}

let network = ENDPOINT.main

let COLOR = {
	background: network != ENDPOINT.main ? "#332d2d" : "#25292e"
}

/// start

let auth = {
	isLoggedIn: false,
	accountName: undefined,
	user: undefined,
	ual: undefined
}

function setup_user() {
	db.set_account(auth.accountName)
	db.invalidate()
	show_username()
	reload_page()
}

async function users_handler(users) {
	if (users.length > 0) {
		let user = users[users.length-1]
		auth.isLoggedIn = true
		auth.accountName = await user.getAccountName()
		auth.user = user
	}
	else {
		auth.isLoggedIn = false
		auth.accountName = undefined
		auth.user = undefined
	}
	setup_user()
	reload_page()
}

window.addEventListener('ual_ready', () => {
	auth.ual = window.ual_create(network, "BUCK Protocol", 'ual_app', users_handler)
	auth.ual.init()
	init_page()
})

ScatterJS.plugins(new ScatterEOS())
let block_explorer = network.explorer
let configDefaults = { 
	logger: { log: null, error: console.error },
	httpEndpoint: network.protocol + "://" + network.host + ":" + network.port, debug: true, verbose: true 
}
let eos = ScatterJS.scatter.eos(network, Eos, configDefaults)

setInterval(() => { db.invalidate(); reload_page() }, 30000)