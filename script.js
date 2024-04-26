class MultiSelect
{
	constructor(select) 
	{
		this.select = MultiSelect.validateSelect(select);
	    this.selected_values = [];
	    this.is_multiple = this.select[0].multiple;
	    this.is_required = this.select[0].required;
	    this.options = MultiSelect.getOptions(this);
	    this.id = this.select[0].id;
	    this.new_select = MultiSelect.createElement(this);
		this.hidden_element = MultiSelect.createHiddenElement(this);
		this.is_trigger = false;
		this.trigger_function = null;
		window.addEventListener('DOMContentLoaded', () => {
			MultiSelect.addEvents(this);
		});
	}

	static validateSelect(select)
	{
		const elementSelect = document.querySelectorAll(`${select}`);

		if (elementSelect.length > 1) {
			console.error(`There is more than one element with this identifier: ${select}`);
			return;
		}

		if (elementSelect[0].nodeName !== 'SELECT') {
			console.error(`The element ${select} is not a select`);
			return;
		}

		return elementSelect;
	}

	static createElement(_this)
	{
		const newElementSelect = document.createElement('div');
		const newElementOptions = MultiSelect.setOptions(_this);
		const inputElement = document.createElement('input');
		const checkAllBox = document.createElement('div');
		const containerBox = document.createElement('div');
		const boxesSelectedValues = document.createElement('div');

		newElementSelect.setAttribute('id', `select_container_${_this.id}`);
		newElementSelect.setAttribute('class', 'select_container');
		newElementSelect.dataset.multiple = _this.is_multiple;
		inputElement.setAttribute('type', 'text');
		inputElement.setAttribute('class', 'input_search_select');
		inputElement.setAttribute('id', `input_search_select_${_this.id}`);
		checkAllBox.setAttribute('id', `checkbox_all_select_${_this.id}`);
		checkAllBox.setAttribute('class', `checkbox_all_select`);
		checkAllBox.innerHTML = `<input type="checkbox" id="check_all_${_this.id}"><label for="check_all_${_this.id}">Selecionar todos</label>`;
		containerBox.setAttribute('class', 'select_container_box');
		boxesSelectedValues.setAttribute('class', 'boxes_selected_values');
		containerBox.appendChild(inputElement);

		if (_this.is_multiple) {
			containerBox.appendChild(checkAllBox);
		}

		containerBox.appendChild(newElementOptions);
		newElementSelect.appendChild(boxesSelectedValues);
		newElementSelect.appendChild(containerBox);

		_this.select[0].parentNode.insertBefore(newElementSelect, _this.select[0].nextSibling);
		_this.select[0].style.display = 'none';

		const _newElementSelect = document.getElementById(`select_container_${_this.id}`);

		return _newElementSelect;
	}

	static getOptions(_this)
	{
		const objOptionsDom = _this.select[0].children;
		const objOptionsValues = [];

		Object.keys(objOptionsDom).forEach(key => {
			if (objOptionsDom[key].value !== '') {
				objOptionsValues[objOptionsDom[key].value] = objOptionsDom[key].outerText;
			}
		});

		return objOptionsValues;
	}

	static setOptions(_this)
	{
		const newElementOptions = document.createElement('div');
		newElementOptions.setAttribute('class', 'select_container_options');
		let optionValues = _this.options;
		Object.keys(optionValues).forEach(key => {
			let option = document.createElement('div');
			option.setAttribute('class', 'select_container_option');
			option.dataset.value = key;
			option.innerText = optionValues[key];
			newElementOptions.appendChild(option);
		});

		return newElementOptions;
	}

	static open(_this, e)
	{
		_this.new_select.classList.add('show_options');
	}

	static close(new_select)
	{
		new_select.classList.remove('show_options');
		new_select.querySelectorAll('.input_search_select')[0].value = '';
		let optionItems = new_select.querySelectorAll('.select_container_option');
		let values = new_select.dataset.value;
		if (values.length > 0) {
			values = JSON.parse(values);
		} else {
			values = [];
		}

		MultiSelect.showOrHideItems(values, optionItems);
	}

	static showOrHideItems(values, optionItems)
	{
		Object.keys(optionItems).forEach(key => {
			if (MultiSelect.inArray(parseInt(optionItems[key].dataset.value), values)){
					optionItems[key].style.display = 'none';
			} else {
				optionItems[key].style.display = 'block';
			}
		})
	}

	setEvent(selected_values)
	{
		if (Object.keys(selected_values).length !== 0) {
			this.selected_values = selected_values;
			this.new_select.dataset.value = `[${selected_values}]`;
			this.select[0].remove();
			this.new_select.appendChild(this.hidden_element);
			MultiSelect.setSelectedValues(this, selected_values, true);
		} else {
			this.selected_values = selected_values;
			this.new_select.dataset.value = `[]`;
			this.select[0].remove();
			this.new_select.appendChild(this.hidden_element);
		}
	}

	static setSelectedValues(_this, selected_values, init)
	{
		let currentValues = [];
		if (_this.new_select.dataset.value !== '') {
			currentValues = JSON.parse(_this.new_select.dataset.value);
		}

		if (_this.is_multiple) {
			if (!init) {
				if (Array.isArray(selected_values)) {
					_this.new_select.dataset.value = '';
					Object.keys(selected_values).forEach(key => {
						currentValues.push(parseInt(selected_values[key]));
					});
				} else {
					if (MultiSelect.inArray(parseInt(selected_values), currentValues)) {
						let filteredValues = currentValues.filter(item => item !== parseInt(selected_values));
						currentValues = filteredValues;
					} else {
						currentValues.push(parseInt(selected_values));
					}
				}
			}

		}

		if (!_this.is_multiple) {
			if (!init) {
				_this.new_select.dataset.value = '';
				if (MultiSelect.inArray(parseInt(selected_values), currentValues)) {
					currentValues = [];
				} else {
					currentValues = parseInt(selected_values);
				}
			} else {
				currentValues = parseInt(selected_values);
			}
		}

		_this.new_select.dataset.value = `[${currentValues}]`;

		MultiSelect.change(_this);
	}

	static change(_this)
	{
		let values = _this.new_select.dataset.value;
		if (values.length > 0) {
			values = JSON.parse(values);
		} else {
			values = [];
		}
		let optionItems = _this.new_select.querySelectorAll('.select_container_option');
		let boxesSelectedValues = '';
		Object.keys(optionItems).forEach(key => {
			if (MultiSelect.inArray(parseInt(optionItems[key].dataset.value), values)){
				boxesSelectedValues += `<div class="boxSelectedValue" data-value="${optionItems[key].dataset.value}"><div class="closeSelectedValue">&times;</div>${optionItems[key].innerText}</div>`;
			}
		});
		MultiSelect.showOrHideItems(values, optionItems);
		_this.new_select.querySelectorAll('.boxes_selected_values')[0].innerHTML = boxesSelectedValues;
		let closeSelectedValue = _this.new_select.querySelectorAll('.closeSelectedValue');

		Object.keys(closeSelectedValue).forEach(key => {
			closeSelectedValue[key].addEventListener('click', (e) => {
				MultiSelect.setSelectedValues(_this, e.target.parentNode.dataset.value, false);
			})
	  	});

		let hasDisplayBlock = false;
		let hasDisplayNone = false;

		Object.values(optionItems).forEach(value => {
			if (value.style.display === 'block') {
				hasDisplayBlock = true;
			}
			if (value.style.display === 'none') {
				hasDisplayNone = true;
			}
	  	});

		if (_this.is_multiple) {
			let checkAll = document.querySelector(`#check_all_${_this.id}`);

			if (hasDisplayBlock === false && hasDisplayNone === true) {
				checkAll.checked = true;
			} else {
				checkAll.checked = false;
			}
		}

		document.getElementById(_this.id).value = JSON.stringify(_this.new_select.dataset.value).replaceAll('"', '');
	}

	static inArray(needle, haystack)
	{
	    var length = haystack.length;
	    for(var i = 0; i < length; i++) {
	        if(haystack[i] == needle) return true;
	    }
	    return false;
	}

	static createHiddenElement(_this)
	{
		const inputHiddenElement = document.createElement('input');
		inputHiddenElement.setAttribute('type', 'hidden');
		inputHiddenElement.setAttribute('name', _this.id);
		inputHiddenElement.setAttribute('id', _this.id);

		return inputHiddenElement;
	}

	static selectAll(e, _this)
	{
		if (e.target.checked) {
			let selected_values = [];
			let optionItems = _this.new_select.querySelectorAll('.select_container_option');
			Object.keys(optionItems).forEach(key => {
				selected_values.push(optionItems[key].dataset.value);
			});

			MultiSelect.setSelectedValues(_this, selected_values, false);
		} else {
			_this.new_select.dataset.value = '';
			MultiSelect.change(_this);
		}
	}

	trigger(_function)
	{
		this.is_trigger = true;
		this.trigger_function = _function;
	}

	static addEvents(_this)
	{
		_this.new_select.addEventListener('click', (e) => {
			MultiSelect.open(_this, e);
		});

		window.addEventListener('click', (e) => {
	    	if(
				e.target !== _this.new_select 
				&& e.target.id !== `input_search_select_${_this.id}` 
				&& e.target.id !== `checkbox_all_select_${_this.id}`
				&& e.target.parentElement.id !== `checkbox_all_select_${_this.id}`
				&& e.target.className !== 'boxes_selected_values'
			) {
	    		MultiSelect.close(_this.new_select);
	    	}
	    });

		let newElementOptions = _this.new_select.querySelectorAll('.select_container_options')[0];
		let inputElement = document.getElementById(`input_search_select_${_this.id}`);
		let optionItems = newElementOptions.children;

		inputElement.addEventListener('input', (e) => {
			let inputed = e.target.value.toLowerCase();
			let selected_values = JSON.parse(_this.new_select.dataset.value);
			

			Object.keys(optionItems).forEach(key => {

			if (optionItems[key].className === 'select_container_option') {
				if (MultiSelect.inArray(parseInt(optionItems[key].dataset.value), selected_values)) {
					
				} else {
					let text = optionItems[key].innerText.toLowerCase();
					if (text.includes(inputed)) {
						optionItems[key].style.display = 'block';
					} else {
						optionItems[key].style.display = 'none';
					}
				}
			}
			})
		});

		Object.keys(optionItems).forEach(key => {
		  	if (optionItems[key].className === 'select_container_option') {
		  		optionItems[key].addEventListener('click', (e) => {
		  			MultiSelect.setSelectedValues(_this, e.target.dataset.value, false);
		  		})
		  	}
		});

		if (_this.is_multiple) {
			let checkAll = document.querySelector(`#check_all_${_this.id}`);
			checkAll.addEventListener('change', (e) => {
				MultiSelect.selectAll(e, _this);
			});
		}

		_this.new_select.querySelectorAll('.boxes_selected_values')[0].addEventListener('click', (e) => {
			e.preventDefault();
			MultiSelect.open(_this, e);
		});

		if (_this.is_trigger) {
			let input_hidden = document.getElementById(`${_this.id}`);
			let event_trigger = new Event('trigger');
			let previousValue = input_hidden.value;

			input_hidden.addEventListener('trigger', function (e) {
				_this.trigger_function(e.target.value);
			}, false);

			input_hidden.dispatchEvent(event_trigger);

			setInterval(function() {
				if (input_hidden.value !== previousValue) {
					previousValue = input_hidden.value;
					input_hidden.dispatchEvent(new Event('trigger'));
				}
			}, 100);
		}
	}
}