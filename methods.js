function sleep(s) {
  return new Promise(resolve => setTimeout(resolve, s * 1000));
}

async function modal(question, title="Attention!") {
	document.getElementById("modal_title").innerHTML = title
	document.getElementById("modal_body").innerHTML = question
	return new Promise((resolve, reject) => {
		$('#modal_dialog').modal({focus:true})
		$('#modal_button').on('click', function(e) {
			resolve(true)
			$('#modal_dialog').modal('hide')
		})
		$('#modal_dialog').on('hide.bs.modal', function(e) {
			resolve(false)
		})
	})
}

async function cdp_view(cdp, show_controls=true) {
	var badge = ""
	var is_closing = false
	let reparam_result = await getTable(TABLE.reparamreq, ACCOUNT.main, ACCOUNT.main, cdp.id)
	if (reparam_result.rows.length > 0) {
		let c = reparam_result.rows[0].change_collateral
		let d = reparam_result.rows[0].change_debt
		var title = ""
		if (amount(d) != 0) {
			title += `Debt: ${amount(d) > 0 ? "+" : ""}${d}`
		}
		if (amount(c) != 0) {
			if (title.length > 0) { title += "\n" }
			title += `Collateral: ${amount(c) > 0 ? "+" : ""}${c}`
		}
		badge = `<li class="list-group-item border-0" style="background:transparent;"><span class="badge badge-secondary" data-toggle="tooltip" title="${title}">Awaiting reparametrization</span></li>`
	}
	else {
		let close_result = await getTable(TABLE.closereq, ACCOUNT.main, ACCOUNT.main, cdp.id)
		if (close_result.rows.length > 0) {
			is_closing = true
			let title = "This CDP will be closed after the next USD price update."
			badge = `<li class="list-group-item border-0" style="background:transparent;"><span class="badge badge-secondary" data-toggle="tooltip" title="${title}">Awaiting to be closed</span></li>`
		}
	}

	let show_taxes = !is_insurer(cdp) && badge == ""
	let taxes = await calculate_tax(cdp, !show_controls)

	let taxed_collateral = asset(amount(cdp.collateral) - taxes.collateral, "REX")
	let taxed_debt = asset(amount(cdp.debt) + taxes.debt, "BUCK")

	let accrued_collateral = asset((await convert(taxes.collateral, false)), "EOS")
	let accrued_debt = asset(taxes.debt, "BUCK")

	let eos_amount = await convert(amount(taxed_collateral), false)
	let eos_collateral = asset(eos_amount, "EOS")
	let rex_collateral = short(amount(taxed_collateral), "REX")

	var col_tax = ``
	if (amount(accrued_collateral) > 0 && show_taxes) {
		let warning = !show_controls && taxes.collateral == 0.0001 ? "\n\n(minimum tax of 0.0001 REX\nwill be accrued when updating cdp)" : ""
		col_tax += `data-toggle="tooltip" title="-${accrued_collateral} taxed ${warning}`
	}
	col_tax += `"`

	var debt = `<span class="align-middle" style="font-size: 20px;">No debt</span>`
	if (amount(taxed_debt) > 0) {let warning = !show_controls && taxes.debt == 0.0001 ? "\n\n(minimum tax of 0.0001 BUCK\nwill be accrued when updating cdp)" : ""
		var tooltip = ""
		if (amount(accrued_debt) > 0 && show_taxes) {
			tooltip = ` data-toggle="tooltip" title="+${accrued_debt} taxed ${warning}"`
		}
		debt = `<span ${tooltip} class="align-middle" style="font-size: 20px;">${taxed_debt}</span>`
	}

	var dcr = ""
	let cdp_dcr = await get_dcr(cdp)
	if (!(cdp_dcr == Infinity || isNaN(cdp_dcr))) {
		dcr = `<span data-toggle="tooltip" title="Debt Collateralization Ratio\nCalculated as: Collateral * Price / Debt\n\nCDP will be partially liquidated\nif this value goes below 150%"><span class="align-middle" style="font-size: 20px;">${cdp_dcr}%</span> <span class="text-secondary align-middle mr-3" style="font-size: 18px;">DCR</span></span>`
	}

	var icr = ""
	if (cdp.icr > 0) {
		icr = `<span data-toggle="tooltip" title="Maximum amount of debt and collateral\nthis CDP may receive in liquidation"><span class="align-middle" style="font-size: 20px;">${cdp.icr}%</span> <span class="text-secondary align-middle" style="font-size: 18px;">ICR</span></span>`
	}

	var close_button = ""
	if (!is_closing) {
		close_button = `<button type="button" style="" onclick="prepare_close(${cdp.id})" class="btn btn-outline-secondary btn-sm">Close</button>`
	}

	var controls = ""
	if (show_controls && auth.user !== undefined) {
		controls = `<li class="list-group-item pt-0 border-0 pr-0" style="background:transparent;">
					<button type="button" id="change-${cdp.id}" style="" onclick="menu_select(this);reload_page()" class="btn btn-outline-secondary btn-sm">Reparametrize</button>
					${close_button}</li>`
	}

	let output = `
		<div class="card text-white bg-dark mb-3">
		<div class="card-body p-0">
			<span class="float-right position-static mt-2 mr-3 text-muted" style="font-size: 25px; opacity: 0.2;" data-toggle="tooltip" title="CDP Identifier\nSpecify this value when\ncreating requests in command line"><b>#${cdp.id}</b></span>

			<ul class="list-group">
				${badge}

				<li class="list-group-item border-0 mr-0" style="background:transparent;">
					<span class="text" style="font-size: 12px;"><nobr>COLLATERAL</nobr></span><br/>
					<nobr ${col_tax}>
					<span class="align-middle" style="font-size: 20px;">${eos_collateral}</span>
					<span class="text-secondary align-middle" style="font-size: 12px;" hidden>${rex_collateral}</span>
					</nobr>
				</li>

				<li class="list-group-item pt-0 border-0" style="background:transparent;">
					<nobr><span class="text" style="font-size: 12px;">DEBT</span><br/>${debt}</nobr>
				</li>

				<li class="list-group-item border-0" style="background:transparent;"><nobr>${dcr}${icr}</nobr></li>
				${controls}

			</ul>
		</div>
		</div>
	`

	$(function () {$('[data-toggle="tooltip"]').tooltip()})
	return output
}

function menu_select(sender, change_href=true) {
	if (change_href) {
		window.location.href = window.location.href.split('#')[0] + "#" + sender.id
		if (is_mobile()) {
			$('#navbarTogglerDemo01').collapse('hide')
			window.scrollTo(0, 0);
		}
	}
	let all_list = Array.from(document.getElementById("menu_items").children)
	all_list.forEach(s => {
		s.classList.remove("active")
	})
	let logged_in_items = Array.from(document.getElementsByClassName("account_only"))
	logged_in_items.forEach(s => {
		s.classList.remove("active")
	})
	if (sender !== null) sender.classList.add("active")
}

function click_row(link) {
	window.location.href = link
	reload_page()
}

let empty_row = `<tr class="border-0" style="height:10px;"><td class="border-0 p-0" colspan="2" class="divider" style="background-color: ${COLOR.background}"></td></tr>` + `<tr class="border-0" style="height:10px;"><td class="border-0 p-0" colspan="2" class="divider" style="background-color: ${COLOR.background}"></td></tr>`

function row(values, link) {
	var rows = ""
	values.forEach(element => { rows += `<td>${element}</td>` })
	if (link !== undefined) return `<tr onclick="click_row('${link}');" pointer>${rows}</tr>`
	else return `<tr>${rows}</tr>`
}

function style_login_button() {
	let button = document.getElementById('ual-button')
		if (button != null) {
		button.id = ""
		button.classList.remove('ual-button-gen')
		button.classList.add('btn')
		button.classList.add('btn-outline-secondary')
		button.innerHTML = "Log in"
	}
}

function alert_transaction_error(error) {
	if (error.message !== undefined) {
		alert(`Transaction did not proceed: ${error.message}`, "warning", ALERT.long)
		return
	}
	try {
		let e = JSON.parse(error)
		var msg = e.error.details[0].message.replace("assertion failure with message: ", "")

		var output = ""
		if (e.error.details[1] !== undefined) {
			output = e.error.details[1].message.replace("pending console output: ", "")
			if (output.length > 0) output = `<br/><br/>Console output:<br/>${ output.split(/\r\n|\r|\n/g).join("<br/>") }`
		}
		alert("Transaction error:<br/>" + msg + output, "danger", ALERT.long)
	}
	catch (e) {
		alert(`Could not make transaction: ${e.message}`, "danger", ALERT.medium)
	}
}

function alert_transaction(tx) {
	var output = ""
	var cpu = ""
	var i = 0
	if (tx.transaction.processed !== undefined) {
		cpu = ` (${tx.transaction.processed.receipt.cpu_usage_us} μs)`
		while (true) {
			let trace = tx.transaction.processed.action_traces[i]
			if (trace === undefined) break
			output += trace.console
			i++
		}
	}

	if (output.length > 0) output = `<br/><br/>Console output:<br/>${ output.split(/\r\n|\r|\n/g).join("<br/>") }`
	else output = ""
	output = output.trim()

	alert(`<a href="${block_explorer}/transaction/${tx.transactionId}">See transaction</a>${cpu}${output}`, "success", ALERT.long)

}

function alert(text, type="success", timeout=ALERT.short) {
	let alert =  $(`<div class="alert fade show alert-${type} alert-dismissable">` +
		`<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>${text}</div>`)
	alert.appendTo("#alerts")
	setTimeout(function() { alert.alert('close') }, timeout)
}