// https://docs.google.com/spreadsheets/d/1Nl-mpRY5YxqZe-yM_kHcX76Tb0mF8EfM7Q6FaKu5qik/edit#gid=0
const sheetId = '1Nl-mpRY5YxqZe-yM_kHcX76Tb0mF8EfM7Q6FaKu5qik';


const sele_station_bar = document.querySelector(".sele_station_bar")
const number_split_bar = document.querySelector(".number_split_bar")
const title_text_input = document.querySelector(".title_text_input")
const people_count_input = document.querySelector(".people_count_input")
const confirm_btn = document.querySelector(".confirm_btn")

const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = 'user-data';
const query = encodeURIComponent('Select *')
const url = `${base}&sheet=${sheetName}&tq=${query}`

const GoogleSheetDATA = []
let number_bar_value = 0
let people_count = 0
let RecordDATA

// ==== addEventListener ====
document.addEventListener('DOMContentLoaded', () => {
	fetch(url).then(res => res.text()).then(rep => {
		const jsonData = JSON.parse(rep.substring(47).slice(0, -2));
		jsonData.table.rows.forEach(data => {
			GoogleSheetDATA.push({station_name: data.c[0].v, station_cost: data.c[1].v})
		})
		for (let i = 0; i < GoogleSheetDATA.length; i++) {
			sele_station_bar.innerHTML += '<option value=\"'+(i+1)+'\">'+GoogleSheetDATA[i].station_name+'</option>'
		}
	})
})

confirm_btn.addEventListener('click', (e) => {
	if (title_text_input.value === '') {
		info_not_fill_in_Error()
		return
	}
	if (people_count_input.value === '') {
		info_not_fill_in_Error()
		return
	}
	if (people_count_input.value < 1) {
		people_count_input.value = ''
		return
	}
	document.querySelectorAll(".Errorinfo").forEach(e => {
		e.setAttribute("hidden","")
	})
	people_count_input.setAttribute('disabled', "true")
	title_text_input.setAttribute('disabled', "true")
	confirm_btn.setAttribute('hidden','')

	people_count = parseInt(people_count_input.value)
	RecordDATA = new Array(people_count).fill(0)

	PRINT()

	document.querySelector('.title').innerHTML += 'click'
	let split = people_count/20
	for (let i = 0; i < split; i++) {
		if((i+1)*20 < people_count) {
			number_split_bar.innerHTML += '<option value="'+i+'">'+(i*20+1).toString().padStart(3,'0')+' ~ '+ (i*20+20).toString().padStart(3,'0') +'</option>'
		}else {
			number_split_bar.innerHTML += '<option value="'+i+'">'+(i*20+1).toString().padStart(3,'0')+' ~ '+ (people_count).toString().padStart(3,'0') +'</option>'
		}
	}
	summon_checkbox_by_number(number_bar_value)
})

function checkbox_change(obj) {
	if (RecordDATA[obj.value-1] === parseInt(sele_station_bar.value) || sele_station_bar.value == -1) {
		if(sele_station_bar.value == -1) obj.checked =false
		RecordDATA[obj.value-1] = 0
		document.querySelectorAll('label.checkboxField')[(obj.value-1)%20].querySelector('small').innerHTML = '(-)'
	}else {
		if(RecordDATA[obj.value-1] != 0) obj.checked =true
		RecordDATA[obj.value-1] = parseInt(sele_station_bar.value)
			document.querySelectorAll('label.checkboxField')[(obj.value-1)%20].querySelector('small').innerHTML = '('+ GoogleSheetDATA[sele_station_bar.value-1].station_name +')'
	}

	PRINT()
}

function info_not_fill_in_Error() {
	document.querySelectorAll(".Errorinfo").forEach(e => {
		e.removeAttribute('hidden')
	})
}

function summon_checkbox_by_number(num) {
	let ckb_field = document.querySelector('.checkboxes')
	ckb_field.innerHTML = ''

	for (let i = 0; i < 20 && num*20+i<people_count; i++) {
		if (RecordDATA[num*20+i] == 0) {
			ckb_field.innerHTML += '<label class="checkboxField"><input type="checkbox" name="checkbox_number" onclick="checkbox_change(this)" value="'+(num*20+i+1)+'">'+(num*20+i+1).toString().padStart(3,'0')+'<small>(-)</small>'+'</label>'
		}else {
			ckb_field.innerHTML += '<label class="checkboxField"><input type="checkbox" name="checkbox_number" onclick="checkbox_change(this)" value="'+(num*20+i+1)+'" checked >'+(num*20+i+1).toString().padStart(3,'0')+'<small>('+ GoogleSheetDATA[RecordDATA[num*20+i]-1].station_name+')</small>'+'</label>'
		}
	}
}

function PRINT() {
	let output = document.querySelector('.output')
	output.textContent = ''

	output.textContent += title_text_input.value +'\n\n'
	for (let i = 0; i < GoogleSheetDATA.length; i++) {
		if (!RecordDATA.find(e => (e - 1) === i)) {
			continue
		}
		output.textContent += GoogleSheetDATA[i].station_name + '站($' + GoogleSheetDATA[i].station_cost * 2 + ') : '
		for (let j = 0; j < people_count; j++) {
			if (RecordDATA[j] - 1 != i) continue
			output.textContent += (j + 1).toString().padStart(3, '0') + ', '
		}
		output.textContent += '\n'
	}
	if (document.querySelector('.more_text').value != '') {
		output.textContent += '\n備註: \n' + document.querySelector('.more_text').value
	}

	output.textContent += '\n==================\n'
	let all_money = 0
	for (let i = 0; i < GoogleSheetDATA.length; i++) {
		if (!RecordDATA.find(e => (e - 1) === i)) {
			continue
		}
		all_money += RecordDATA.filter(e=>{return (e-1) === i}).length*GoogleSheetDATA[i].station_cost*2
		output.textContent += GoogleSheetDATA[i].station_name + '站 共 ' + RecordDATA.filter(e=>{return (e-1) === i}).length + '員 搭乘($'+RecordDATA.filter(e=>{return (e-1) === i}).length*GoogleSheetDATA[i].station_cost*2+')'

		output.textContent += '\n'
	}

	output.textContent += '\n共有 '+RecordDATA.filter(e=>{return e != 0}).length+'員 坐專車\n'
	output.textContent += '專車費 共 '+all_money+'元\n\n'

	output.textContent += "統計時間 "+ new Date().toLocaleString('en-US', {
		hour12: false,
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}
function copy() {
	document.querySelector('.output').select()
	document.execCommand("Copy")
}