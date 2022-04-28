console.log(resData);
var skuNameMap = {
	'color': '颜色',
	'type': '尺寸',
	'mianliao': '面料',
	// 'price': '价格',
};
/**
 * 需要展示/保存状态的信息 start
 */
// 规格列表
var skuList = [];
// 当前选中的规格
var currentSelect = {
	color: '',
	type: '',
	mianliao: '',
};
/**
 * 需要展示/保存状态的信息 end
 */

// 初始化页面
initPage();

// 数据结构处理
function getSkuList() {
	if (resData.json2 && resData.json2[0]) {
		Object.keys(resData.json2[0]).forEach(function (item, index) {
			if (item !== 'price') {
				skuList.push({
					prop: item,
					propName: skuNameMap[item],
					list: resData.json1[index],
				});
			}
		});
		console.log('处理后的skuList: ', skuList);
	}
}

// 渲染sku
function drawSku() {
	if (skuList.length === 0) return;
	var oSku = document.querySelector('.sku');
	var htmlStr = ''; // 一行规格的HTML string
	skuList.forEach(function (item, index) {
		if (item.list && item.list.length > 0) {
			var valStr = ''; // 规格选项的html string
			item.list.forEach(function (val) {
				// 为了方便该元素点击事件从 event 上获取信息，加上 data-* 属性
				var dataProp = ' data-prop="' + item.prop + '" ';
				var dataVal = ' data-val="' + val + '" ';
				valStr += '<div class="value"' + dataProp + dataVal + 'onclick="handleSelectSku(event)">' + val + '</div>';
				// console.log(valStr); // 可以看到这里的dom string
			})
			htmlStr += '\
				<div class="row">\
					<div class="label">' + item.propName + '</div>\
					<div class="value-box">' + valStr + '</div>\
				</div>\
			';
		}
	})

	oSku.innerHTML = htmlStr;
}

function handleSelectSku(event) {
	// console.log(event);
	var oSkuResult = document.querySelector('.sku-result');
	var prop = event.target.dataset.prop;
	var val = event.target.dataset.val;
	// console.log(prop, val);
	currentSelect[prop] = val;
	// 清除上一个选中的class
	if (currentSelect[prop + 'Dom']) {
		currentSelect[prop + 'Dom'].className = currentSelect[prop + 'Dom'].className.replace(' active', '');
	}
	if (event.target.className.indexOf('active') === -1) {
		// 未选中状态，则添加class
		event.target.className += ' active';
		currentSelect[prop + 'Dom'] = event.target;
	} else {
		// 已选中状态，可做其他处理
	}

	// 检验是否所有属性都选好了
	var keys = Object.keys(skuNameMap);
	for (var i = 0; i < keys.length; i++) {
		// 如果没有直接返回，否则继续
		if (!currentSelect[keys[i]]) {
			oSkuResult.style.visibility = 'hidden';
			return;
		}
	}

	var skuItem = resData.json2.find(function (item) {
		var isPass = true;
		for (var i = 0; i < keys.length; i++) {
			if (item[keys[i]] !== currentSelect[keys[i]]) {
				isPass = false;
				break;
			}
		}
		return isPass;
	})

	console.log('选好的规格信息：', skuItem);
	oSkuResult.style.visibility = 'visible';
	var oSkuInfo = oSkuResult.querySelector('.sku-info');
	var oPrice = oSkuResult.querySelector('.price');
	var text = '';
	for (var i = 0; i < keys.length; i++) {
		text += skuItem[keys[i]] + ', ';
	}
	oSkuInfo.textContent = text;
	oPrice.textContent = skuItem.price;
}

// function bindDomEvent(params) {
// 	// var oSkuValue = document.querySelectorAll('.sku .value');
// 	// console.log(oSkuValue);
// 	// oSkuValue[0].addEventListener('click', function (event) {
// 	// 	console.log(event);
// 	// })
// }

function initPage(params) {
	// 处理sku数据
	getSkuList();
	// 渲染sku
	drawSku();
	// 添加绑定事件
	// bindDomEvent();
}
