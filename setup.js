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

let network = ENDPOINT.jungle

let ACCOUNT = {
	main:"buckprotocol", eosio: "eosio", token: "eosio.token"
}

let COLOR = {
	background: network != ENDPOINT.main ? "#332d2d" : "#25292e"
}

/// start

ScatterJS.plugins(new ScatterEOS())
let block_explorer = network.explorer
let configDefaults = { httpEndpoint: network.protocol + "://" + network.host + ":" + network.port, debug: true, verbose: true }
let eos = ScatterJS.scatter.eos(network, Eos, configDefaults)

ScatterJS.connect('BUCK Protocol', { network })
	.then(connected => { 
		if (!connected) {
			alert("Unable to connect to Scatter", "danger", ALERT.long)
			reload_page()
		}
		else {
			setup_user() 
		}
	})
	.catch(error => { 
		// reload_page() - don't show scatter login
		alert(error.message, "danger", ALERT.long)
	})

/// login data

var logged_in = false
var account = undefined