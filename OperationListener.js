const {Apis} = require('bitsharesjs-ws');
const {ChainTypes} = require('bitsharesjs');
const operationTypesDictonary = ChainTypes.operations;
const fs = require('fs');

class OperationListener{

	constructor(){
		Apis.instance().db_api().exec("set_subscribe_callback",[(message) => {
			this.fetchSubsribeCallback(message)
		},true]);
	}

	fetchSubsribeCallback(message){
		message[0].forEach((value)=>{
				this.checkHistoryOperation(value);
/*
			if(Array.isArray(value)){
							

				value.forEach((singeOp)=>{
					this.checkHistoryOperation(singeOp);
				})
			}
			else{
				this.checkHistoryOperation(value);
			}*/
		})
	}

	checkHistoryOperation(operation){
		if(operation['id']){
			if(operation['id'].includes('1.11.')){
				let report = operation['op'][1];
				//this.writeToFile(JSON.stringify(report));
				let user_ids_array = ['1.3.225','1.2.596737','1.2.512210'];
				let dict = ['transfer','limit_order_create'];

				let filter = {
					transfer: {user_field: 'to',callback: this.retreiveTransfer.bind(this)},
					limit_order_create: {user_field: 'seller',callback:this.retreiveOrderCreate.bind(this)},
					fill_order: {user_field: 'account_id',callback: this.retreiveFillOrder.bind(this)}
				}

				const op = dict[operation['op'][0]];
				if (op != undefined){
					if ((filter[op] != undefined) && (user_ids_array.indexOf(report[filter[op].user_field]) > -1)){
						filter[op].callback(report);
					}
				}
			}
		}
	}

	retreiveTransfer(source){
		this.writeToFile('tranfer\n'+JSON.stringify(source));

		const fromAccountId = source.from;
		const toAccountId = source.to;

		const transferAssetId = source.amount.asset_id;
		const feeAssetId = source.fee.asset_id;

		const transferAmount = source.amount.amount;
		const feeAmount = source.fee.amount;

		console.log(source);
	}

	retreiveOrderCreate(source){
		//this.writeToFile('create\n'+JSON.stringify(source));
		const feeAmount = source.fee.amount;
		const feeAssetId = source.fee.asset_id;

		const seller = source.seller;

		const amountToSell = source.amount_to_sell.amount;
		const amountToSellAssetId = source.amount_to_sell.asset_id;

		const minToReceiveAmount = source.min_to_receive.amount;
		const minToReceiveAssetId = source.min_to_receive.asset_id;

		const expiration = source.expiration;
	}

	retreiveOrderCancel(source){
		const feeAmount = source.fee.amount;
		const feeAssetId = source.fee.asset_id;
		const feePaymentAccounId = source.fee_paying_account;

		const orderId = source.order;
	}

	retreiveFillOrder(source){
		const feeAmount = source.fee.amount;
		const feeAssetId = source.fee.asset_id;

		const orderId = source.order_id;
		const accountId = source.account_id;

		const paysAmount = source.pays.amount;
		const paysAssetId = source.pays.asset_id;

		const receivesAmount = source.receives.amount;
		const receivesAssetId = source.receives.asset_id;

		const baseeAmount = source.fill_price.base.amount;
		const baseAssetId = source.fill_price.base.asset_id;

		const quoteAmount = source.fill_price.quote.amount;
		const quoteAssetId = source.fill_price.quote.asset_id;

		const isMaker = source.isMaker;
	}

	writeToFile(data){
		fs.appendFile('order_log', data+'\n\n', function(error){
			if(error) throw error;
		});
	}
}

module.exports = OperationListener;  