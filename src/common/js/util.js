/**
 * 日期转换函数
 */
/* eslint-disable no-tabs,indent */
export function formatDate(date, fmt) {
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	let o = {
		'M+': date.getMonth() + 1,
		'd+': date.getDate(),
		'h+': date.getHours(),
		'm+': date.getMinutes(),
		's+': date.getSeconds()
	}
	for (let k in o) {
		if (new RegExp(`(${k})`).test(fmt)) {
			let str = o[k] + ''
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
		}
	}
	return fmt
}
function padLeftZero(str) {
	return ('00' + str).substr(str.length)
}

/**
 * 解析url参数
 * @example ?id=12345&a=b
 * @return Object {id:12345,a:b}
 */
export function urlParse() {
	let url = window.location.search
	let obj = {}
	let reg = /[?&][^?&]+=[^?&]+/g  // 包含?或&字符，后面跟着非(^)?或&字符=一个或多个(非?或&字符)
	let arr = url.match(reg)
	// ['?id=12345', '&a=b']
	if (arr) {
		arr.forEach((item) => {
			let tempArr = item.substring(1).split('=') // [id,12345];[a,b]
			// decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码
			let key = decodeURIComponent(tempArr[0])
			let val = decodeURIComponent(tempArr[1])
			obj[key] = val
		})
	}
	return obj
}

/**
 * 本地存储
 * localStorage只能存储字符串,所以多用到JSON.parse和JSON.stringify
 * @param  {[type]} id    商家的id
 * @param  {[type]} key   要存储的元素，例收藏"favorite"
 * @param  {[type]} value 存储元素的值，例true
 * @return localStorage.__seller__= "{"id":{"key":value}}"="{"12345":{"favorite":true}}"
 */
export function saveToLocal(id, key, value) {
	let seller = window.localStorage.__seller__
	if (!seller) {   // 本地无存储时
		seller = {}
		seller[id] = {}
	} else {
		seller = JSON.parse(seller)
		if (!seller[id]) {  // 如果没有id，就存成一个空对象
			seller[id] = {}
		}
	}
	seller[id][key] = value
	window.localStorage.__seller__ = JSON.stringify(seller)  // localStorage时只能存储字符串的
}

/**
 * 本地localStorage读取
 * @param  {[type]} id  商家的id
 * @param  {[type]} key 要读取的元素，例收藏"favorite"
 * @param  {[type]} def 默认值
 * @return {[type]}     结果值
 */
export function loadFromLocal(id, key, def) {
	let seller = window.localStorage.__seller__
	if (!seller) {  // 本地无存储时取默认值
		return def
	}
	seller = JSON.parse(seller)[id]
	if (!seller) {  // 无id值返回默认
		return def
	}
	let ret = seller[key]
	return ret || def
}
