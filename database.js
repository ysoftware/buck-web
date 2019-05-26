class Data {
	constructor(expiration, updater, default_value=undefined) {
		this.object = default_value
		this.expiration = expiration
		this.updated = 0
		this.updater = updater
		this.isLoading = false
	}

	async get(reloadTime) {
		let next_reload = this.updated + this.expiration
		if ((this.object === undefined || next_reload < reloadTime) && !this.isLoading) {
			this.isLoading = true
			this.object = await this.updater.call()
			this.isLoading = false
			if (this.object !== undefined) {
				this.updated = now()
			}
		}
		return this.object
	}
}

class Database {
	constructor() { this.init() }

	init(account=undefined) {
		this.reloadTime = now()
		this.account = account

		this._cdps = new Data(30, async () => {
			if (this.account === undefined) return []
			let result = await getTable(TABLE.cdp, ACCOUNT.main, ACCOUNT.main, account.name, '5', 'i64', 100)
			if (result === undefined && result.rows.length == 1) return []
			return result.rows
		}, [])

		this._stat = new Data(30, async () => {
			let result = await getTable(TABLE.stat, ACCOUNT.main, "BUCK")
			if (result === undefined) return undefined
			return result.rows[0]
		})

		this._tax = new Data(30, async () => {
			let result = await getTable(TABLE.taxation, ACCOUNT.main)
			if (result === undefined) return undefined
			return result.rows[0]
		})

		this._balance = new Data(30, async () => {
			if (this.account === undefined) return undefined
			let result = await getTable(TABLE.accounts, ACCOUNT.main, this.account.name)
			if (result === undefined && result.rows.length == 1) return undefined
			return result.rows[0]
		})

		this._fund = new Data(30, async () => {
			if (this.account === undefined) return undefined
			let result = await getTable(TABLE.fund, ACCOUNT.main, ACCOUNT.main, this.account.name)
			if (result === undefined && result.rows.length == 1) return undefined
			return result.rows[0]
		})

		this._rex = new Data(30, async () => {
			if (this.account === undefined) return undefined
			let result = await await getTable(TABLE.rexpool, ACCOUNT.eosio)
			if (result === undefined && result.rows.length == 1) return undefined
			return result.rows[0]
		})

		this._eos = new Data(30, async () => {
			if (this.account === undefined) return undefined
			let result = await getTable(TABLE.accounts, ACCOUNT.token, this.account.name)
			if (result === undefined && result.rows.length == 1) return undefined
			return result.rows[0]
		})
	}

	set_account(account) {
		this.account = account
	}

	invalidate() { this.init(this.account) }

	async stat() { return await this._stat.get(this.reloadTime) }
	async cdps() { return await this._cdps.get(this.reloadTime) }
	async fund() { return await this._fund.get(this.reloadTime) }
	async tax() { return await this._tax.get(this.reloadTime) }
	async balance() { return await this._balance.get(this.reloadTime) }
	async eos() { return await this._eos.get(this.reloadTime) }
	async rex() { return await this._rex.get(this.reloadTime) }
}

async function savings_price() {
	let tax = await db.tax()
	if (tax === undefined) return undefined
	var savings_price = 0
	if (tax.savings_supply > 0) {
		savings_price = amount(tax.savings_pool) / tax.savings_supply 
	}
	return savings_price
}

async function price() {
	return (await db.stat()).oracle_eos_price
}

let db = new Database()