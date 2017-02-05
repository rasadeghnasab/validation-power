/**
 * Created by Raminli on 9/14/2015.
 */
//loadScript('vpJqueryFormValidate/languages/validationPower_plugin_lang.js');
(function ($) {
	$.fn.validationPower = function (options, tooltip_plugin_options) {

		// if noting is selected
		if (!this.length) {
			// TODO:select a form element in page if exists
			//var form = $('form');
			if (options && options.debug && window.console) {
				console.warn("Nothing selected, can't validate, returning nothing.");
			}
			return;
		}

		var form,
			elements,
			defaultSetting = {
				fieldMaxLength: 35,
				fieldMinLength: 0,
				errorShow: '',
				button: '',
				autotab: true,
				remainChars: false,
				remainCharsShow: '',
				letterFlash: {
					flashShow: '',
					flashLastChars: 1,
					flashStyle: {
						display: 'none',
						position: 'absolute',
						right: '100%',
						top: '-50%',
						width: '100px',
						'font-size': '50px'
					}
				},
				noValidate: false,
				allowedChars: false,
				disallowedChars: false,
				language_letters: 'langEn',
				language_num: 'langEn'
			},
			settings = defaultSetting,
			errors = {},
			button,
			requirements,
			invalid_chars = /([÷×\\\|\$\^\?\+\(\)\[\]\{}\*<>&~`!;#%='"])|(^[\s])/gi,
			multi_space = /([\s]{2,})/gi
			;

		if (options) {
			settings = $.extend(defaultSetting, options);
		}

		form = !$(this).is('form') ? $(this).parents('form') : $(this);

		// If selected element is form or is a child of a form.
		if (form.length) {

			elements = $(this).is('form') ? $(this).find(':input') : $(this);

			form.on('submit', function (e) {
				if (!check_errors(errors, requirements, elements)) {
					e.preventDefault();
					button.attr('disabled', 'disabled');
				}
			});

			// Add novalidate attribute if HTML5.
			form.attr("novalidate", "novalidate");

			// find related button to the form (if a form exist )
			button = !settings.button ? form.find(':submit') : !settings.button;
		}

		// select related button(s). It can be an input-submit or a button.
		button = button.length ? button : $(settings.button);

		requirements = elements.map(function () {
			if ($(this).is('.required, [required=required], [required]')) {
				return $(this);
			}
		});

		// Check for enable or disable related button at the beginning.
		if (!check_requirements(requirements)) {
			button.attr('disabled', 'disabled');
		}

		//var autotab = settings.autotab;
		//if ($.autotab) {
		//    elements.autotab({tabOnSelect: true});
		//}
		//else {
		//    console.log('You can add autotab plugin to your project and Enjoy all those features');
		//}

		elements.each(function () {
			var name = $(this).attr_existence_check('name'),
				elem;

			elem = name ? $('[name="' + name + '"]') : $(this);

			if (elem.is('input:not([type=radio], [type=checkbox], select), textarea')) {
				elem.on('vp-check input focus blur', function (e) {
					// Find all validations which set for an element
					validations = $(this).findValidation();
					// if element has no validation then exit from this event handler
					if (!validations) return true;
					var element = $(this),
						value = element.val(),
						input_lang = element.findLanguage(settings.language_letters),
						special_lang = input_lang,
						no_lang = element.attr_existence_check('data-no-lang', true),
						element_id = element.attr_existence_check('id') ? element.attr_existence_check('id') : null,
						field_name = element.get_field_name(),
					// a unique id for each input which we want to work with
						id = element.attr_existence_check('data-validationId'),
						validations,
						changeable_value = value,
					// errorShow variable: find element which
						errorShow = settings.errorShow,
						flash_setting = settings.letterFlash,
						errors_addresses = {},
						remainNum,
						remainCharsShow = element.attr_existence_check('data-remainCharShow') ? element.attr_existence_check('data-remainCharShow') : settings.remainCharsShow,
						beep,
						mask = element.attr_existence_check('mask'),
						pattern = element.attr_existence_check('pattern'),
						special_regexp = invalid_chars,
						accept_chars = element.acceptable_chars(settings.allowedChars),
						disallowed_chars = element.disallow_chars(settings.disallowedChars),
						max_length = element.maxlength(settings.fieldMaxLength),
						min_length = element.minlength(settings.fieldMinLength),
						range = element.get_vprange(),
						age_range = element.get_agerange(),
					// noValidate variable: when this variable is true no validation perform on this element
						noValidate = element.noValidateElement() || settings.noValidate,
						length_check = false,

					// remainChars variable: when this variable is true, count remain character on user input
						remainChars = settings.remainChars;

					// Set id when user focus on an element for the first time.
					if (!id) {
						var date = new Date();
						id = date.getTime();
						element.attr('data-validationId', id);
					}


					// Set remain chars
					var remainChars_index = $.inArray('remainChars', validations);
					if (remainChars_index > -1) {
						remainChars = true;
						// remove remainChars element from validation array
						//validations.splice(remainChars_index, 1);
					}

					var letter_flash = $.inArray('vp-letter-flash', validations);
					letter_flash = letter_flash > -1 && e.type == 'input';

					if (pattern) {
						validations.push('pattern');
					}

					var sound = false;

					$.each(validations, function (index, validate_name) {
						if (noValidate) return false;
						switch (validate_name) {
							case 'number':
								special_regexp = /,/gi;
								// if it has no input class persian set default to english for number
								if (!element.findLanguage('', true)) {
									special_lang = settings.language_num;
								}

								var num_validate = number_validate(changeable_value);

								if ($.inArray('comma', validations) > -1) {
									special_regexp = /[]/gi;
									// remove everything except numbers then put , on every 3digit on input
									changeable_value = changeable_value.replace(/\D/g, "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
								}

								// if number validated successfully.
								if (num_validate !== true) {
									changeable_value = num_validate;
								}

								break;

							case 'mobile':
								var phone_regexp = /(^00\d{2}|^\+?9|^9|^0{3,})/gi;
								changeable_value = changeable_value.replace(phone_regexp, '09');
								if (changeable_value.length >= 5 && !changeable_value.match(/^(09)/)) {
									changeable_value = "09" + changeable_value;
								}
								break;

							case 'email':
								special_regexp = /[\s\/]/gi;
								// if it has no in input class persian set default to english for number
								if (!element.findLanguage('', true)) {
									special_lang = settings.language_letters;
								}

								// email address must be lowercase
								changeable_value = changeable_value.toLowerCase();

								var em_validate = email_validate(changeable_value);

								// if email validated successfully.
								if (em_validate) {
									changeable_value = em_validate;
									errors_addresses[id + '_email'] = false;
								}
								else {
									// error about email validation of this element
									errors_addresses[id + '_email'] = {};
									errors_addresses[id + '_email']['type'] = 'error';
									errors_addresses[id + '_email']['parameters'] = {};
									errors_addresses[id + '_email']['parameters']['field_name'] = field_name;
								}

								break;

							case 'username':
								// it has no error to show

								special_regexp = /[@\s\/:\.]/;

								if (!element.findLanguage('', true)) {
									special_lang = settings.language_letters;
								}

								break;

							case 'name':
							case 'address':
								if (validate_name == 'name') {
									special_regexp = /[\d»«ـ؛:\.،\/؟@_,-]/g;
								}
								else if (validate_name == 'address') {
									special_regexp = /[»«ـ؛@_]/g;
								}

								break;

							case 'url':
								special_regexp = /[\s]/gi;
								// if it has no in input class persian set default to english for number
								if (!element.findLanguage('', true)) {
									special_lang = settings.language_letters;
								}

								// email address must be lowercase
								changeable_value = changeable_value.toLowerCase();

								var validated_url = url_validate(changeable_value);
								// if email validated successfully.
								if (!validated_url) {
									// error about email validation of this element
									errors_addresses[id + '_url'] = {};
									errors_addresses[id + '_url']['type'] = 'error';
									errors_addresses[id + '_url']['parameters'] = {};
									errors_addresses[id + '_url']['parameters']['field_name'] = field_name;
								}
								else {
									errors_addresses[id + '_url'] = false;
								}
								break;
							case 'match':
								// Matched is class which determine that this element has a match
								var matched = element.attr('class').match(/vp-match\w+/gi),
									match = true,
									field_names = field_name,
									match_id = element.attr_existence_check('data-matchId'),
									new_match_id = match_id ? match_id : (new Date()).getTime();
								$('.' + matched[0]).each(function (index, element) {
									// All of matched elements must have same match_id and work with that.
									if (!match_id) {
										$(element).attr('data-matchId', new_match_id);
									}
									// If values are not same, we must have error.
									if (value != $(element).val() && $(element).val() != '') {
										match = false;
										field_names += ', ' + $(element).get_field_name();
									}
								});

								if (!match) {
									// Match error.
									errors_addresses[match_id + '_match'] = {};
									errors_addresses[match_id + '_match']['type'] = 'error';
									errors_addresses[match_id + '_match']['parameters'] = {};
									errors_addresses[match_id + '_match']['parameters']['field_name'] = field_names;
								}
								else {
									errors_addresses[match_id + '_match'] = false;
								}
								break;
							case 'password':
								// TODO:: password must be nolang
								no_lang = true;
								noValidate = true;
								length_check = true;
								break;
							case 'pattern':
								if (!changeable_value.match(pattern)) {
									// error about email validation of this element
									errors_addresses[id + '_pattern'] = {};
									errors_addresses[id + '_pattern']['type'] = 'error';
									errors_addresses[id + '_pattern']['parameters'] = {};
									errors_addresses[id + '_pattern']['parameters']['field_name'] = field_name;
								}
								else {
									errors_addresses[id + '_pattern'] = false;
								}
								break;
							case 'national_code':
								var national_code = national_code_validation(changeable_value);
								if (!national_code) {
									// error about email validation of this element
									errors_addresses[id + '_nationalcode'] = {};
									errors_addresses[id + '_nationalcode']['type'] = 'error';
									errors_addresses[id + '_nationalcode']['parameters'] = {};
									errors_addresses[id + '_nationalcode']['parameters']['field_name'] = field_name;
								}
								else {
									errors_addresses[id + '_nationalcode'] = false;
								}
								break;
						}
						if (!noValidate) {
							// If it has any invalid chars remove them and play beep
							beep = changeable_value;
							changeable_value = changeable_value.replace(invalid_chars, '').replace(special_regexp, '').replace(multi_space, ' ');
						}
					});

					// language check and change.
					if (!no_lang) {
						changeable_value = convertLang(changeable_value, special_lang);
						changeable_value = changeable_value.replace('vXhg', 'R');
					}

					// accept_chars, invalid_chars, disallowed_chars
					if (!noValidate) {
						// Handling allowed or disallowed chars
						if (accept_chars) {
							// remove other chars
							changeable_value = changeable_value.replace(accept_chars, '');
						}

						if (disallowed_chars) {
							// remove this chars
							changeable_value = changeable_value.replace(disallowed_chars, '');
						}

						// check to see if we must play sound or not.
						sound = beep != changeable_value;
					}

					if (range) {
						var rang_error = false,
							range_value = changeable_value.replace(/\D/gi, '');
						if (range.min && parseFloat(range_value) < range.min) {
//                            changeable_value = range.min;
							rang_error = true;
						}
						else if (range.max && parseFloat(range_value) > range.max) {
							//changeable_value = range.max;
							rang_error = true;
						}

						if (rang_error) {
							// error about email validation of this element
							if (range.max && range.min) {
								errors_addresses[id + '_range'] = {};
								errors_addresses[id + '_range']['type'] = 'error';
								errors_addresses[id + '_range']['parameters'] = {};
								errors_addresses[id + '_range']['parameters']['field_name'] = field_name;
								errors_addresses[id + '_range']['parameters']['min'] = range.min;
								errors_addresses[id + '_range']['parameters']['max'] = range.max;
							}
							else if (range.max) {
								errors_addresses[id + '_range_max'] = {};
								errors_addresses[id + '_range_max']['type'] = 'error';
								errors_addresses[id + '_range_max']['parameters'] = {};
								errors_addresses[id + '_range_max']['parameters']['field_name'] = field_name;
								errors_addresses[id + '_range_max']['parameters']['max'] = range.max;
							}
							else if (range.min) {
								errors_addresses[id + '_range_min'] = {};
								errors_addresses[id + '_range_min']['type'] = 'error';
								errors_addresses[id + '_range_min']['parameters'] = {};
								errors_addresses[id + '_range_min']['parameters']['field_name'] = field_name;
								errors_addresses[id + '_range_min']['parameters']['min'] = range.min;
							}
						}
						else {
							errors_addresses[id + '_range'] = false;
							errors_addresses[id + '_range_min'] = false;
							errors_addresses[id + '_range_max'] = false;
						}

					}

					// length section starts.
					if (!noValidate || length_check) {
						//  if we have max length and out min length is bigger that minlength then,
						// user never can rich to minlength and always see an error
						//  here we check that this not happen to user. and if it's going to happen,
						// we set minlength equal to maxlenght
						min_length = parseFloat(max_length) < parseFloat(min_length) ? parseFloat(max_length) : parseFloat(min_length);
						// check min length limit.
						if (changeable_value.length < min_length) {
							// error about minlength validation of this element
							// if minlength == maxlength we must have exact length
							var length_error = parseFloat(max_length) == parseFloat(min_length) ? '_exactlength' : '_minlength';
							errors_addresses[id + length_error] = {};
							errors_addresses[id + length_error]['type'] = 'error';
							errors_addresses[id + length_error]['parameters'] = {};
							errors_addresses[id + length_error]['parameters']['field_name'] = field_name;
							errors_addresses[id + length_error]['parameters']['length'] = min_length;
						}
						else {
							errors_addresses[id + '_minlength'] = false;
							errors_addresses[id + '_exactlength'] = false;
						}
					}

					if (remainChars) {
						remainNum = max_length - changeable_value.length;
						element.remain_chars_show(remainCharsShow, remainNum);
					}
					// length section ends.

					// Mask
					var caretPos;
					if (mask) {
						var persist = element.attr_existence_check('persist', true);
						var masked = mask_fn(changeable_value, mask, persist);
						caretPos = masked.caretPos;
						changeable_value = masked.str;
						//sound = value != changeable_value;
						sound = false;
						//string_length = changeable_value.length;
					}

					if (age_range && typeof persianDate != 'undefined') {
						// check to see entered date is exits
						if (check_date(changeable_value)) {
							errors_addresses[id + '_datecheck'] = false;
							// If age range.
							// Check to see age range.
							// check age:return an array with year,month,day
							var age_rang_error = false,
								age_range_value = age_calc(changeable_value)
								;

							if (age_range.min && parseInt(age_range_value.year) < age_range.min) {
								age_rang_error = true;
							}
							else if (age_range.max && parseInt(age_range_value.year) > age_range.max) {
								age_rang_error = true;
							}

							if (age_rang_error) {
								if (age_range.max && age_range.min) {
									errors_addresses[id + '_agerange'] = {};
									errors_addresses[id + '_agerange']['type'] = 'error';
									errors_addresses[id + '_agerange']['parameters'] = {};
									//errors_addresses[id + '_agerange']['parameters']['field_name'] = field_name;
									errors_addresses[id + '_agerange']['parameters']['minage'] = age_range.min;
									errors_addresses[id + '_agerange']['parameters']['maxage'] = age_range.max;
								}
								else if (age_range.max) {
									errors_addresses[id + '_maxagerange'] = {};
									errors_addresses[id + '_maxagerange']['type'] = 'error';
									errors_addresses[id + '_maxagerange']['parameters'] = {};
									//errors_addresses[id + '_maxagerange']['parameters']['field_name'] = field_name;
									errors_addresses[id + '_maxagerange']['parameters']['maxage'] = age_range.max;
								}
								else if (age_range.min) {
									errors_addresses[id + '_minagerange'] = {};
									errors_addresses[id + '_minagerange']['type'] = 'error';
									errors_addresses[id + '_minagerange']['parameters'] = {};
									//errors_addresses[id + '_minagerange']['parameters']['field_name'] = field_name;
									errors_addresses[id + '_minagerange']['parameters']['minage'] = age_range.min;
								}
							}
							else {
								errors_addresses[id + '_agerange'] = false;
								errors_addresses[id + '_minagerange'] = false;
								errors_addresses[id + '_maxagerange'] = false;
							}
						}
						else {
							errors_addresses[id + '_datecheck'] = {};
							errors_addresses[id + '_datecheck']['parameters'] = {};
							errors_addresses[id + '_datecheck']['type'] = 'error';

							errors_addresses[id + '_datecheck']['parameters']['field_name'] = field_name;
						}

					}
					else if (typeof persianDate == 'undefined') {
						//alert('You must add Persian date plugin to use time function');
						console.log('You must add PersianDate plugin to use time function');
						console.log('Download PersianDate plugin from this url: https://github.com/babakhani/PersianDate');
					}

					// show last characters
					if (letter_flash) {
						letter_flash_view({
							element: element,
							setting: flash_setting
						}, changeable_value);
					}

					// Caps lock on or off
					if (isCapslock(e)) {
						errors_addresses[id + '_capslock'] = {};
						errors_addresses[id + '_capslock']['type'] = 'error';
					}

					// play alert sound
					if (sound) {
						playSound();
					}

					// Set element cursor. Prevent to element cursor jump to the end of input field on type.
					element.val_cursor(changeable_value, caretPos);

					// handling all errors: showing and hiding errors
					if ((!noValidate || length_check) && value != '') {
						errors = error_handler({
								element: element, errorShow: errorShow, errors: errors, errors_addresses: errors_addresses
							}
							, tooltip_plugin_options);
					}

					check_errors(errors, requirements, elements) ? button.removeAttr('disabled') : button.attr('disabled', 'disabled');

				});
				if ($.inArray('time', elem.findValidation()) != -1 && jQuery().pDatepicker) {
					elem.pDatepicker({format: "YYYY/MM/DD", observer: true, viewMode: 'year'});
				}
				/*
				 // integrate with mlKeyboard
				 if ($(this).attr_existence_check('data-vpkeyboard') && !elem.next('img').hasClass('vpKeyboard') && $.fn.mlKeyboard) {
				 var first_validation = elem.findValidation(),
				 number_index = $.inArray('number', first_validation),
				 lang = number_index > -1 ? 'language_num' : 'language_letters',
				 language = elem.findLanguage(settings[lang]).replace(/.*-/gi, ''),
				 default_disallowed = settings.disallowedChars ? settings.disallowedChars : [],
				 default_allowed = settings.allowedChars ? settings.allowedChars : [],
				 accept_chars = elem.attr_existence_check('data-allowed-chars') ? elem.attr_existence_check('data-allowed-chars').replace(/,|/gi).split('') : default_allowed,
				 disallowed_chars = elem.attr_existence_check('data-allowed-chars') ? elem.attr_existence_check('data-allowed-chars').replace(/,|/gi).split('') : default_disallowed,
				 id = $(this).attr('id');
				 $(this).mlKeyboard({
				 layout: language
				 //num: number_index > -1,
				 });
				 $(this).after($('<img>').addClass('vpKeyboard').attr('src', 'data:image/png;base64,iVBOnw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABUUlEQVRIS7WVgW3CMBBFPxOUDdoNygbQDbpBGaGdoLABI8AG3aBlA9iAEcoErR66jw4piVESR7LkOOf/v//dORNVfiaV8VUimEn6lXTqK6REsAjgn1oEK0nbWicAfCrpva969rVZtAzvv4aAdxFgCySDn7YToPx1MHpYhM/PY4A1YBw5waEiwQGCv5HU0zM0JoMcbphngr0kgijPz7CP929JL5JoNsTkeVFbJsAqap7qYVgRSljnOyR5DkEnoQnOAfAUzQUY80dJnMyFcIz+mMc6hO70RqtNkO1B+T1WrcNO2wQBeLb1sm4CbkuU8BHlnpuINWyzWvLEnnzLWhhJxtYbAr9/hFUkdpeqActcGcQ6V2+xMccSRzwY1xOYICfMFuAzA9W+trOF7M2xjrvkZMw+aCxZCPhjPRQLul/AGQIuNRJIKY75IHxT+mUOJqxO8A+Kw14fVG3NggAAAABJRU5ErkJggg=='));
				 }
				 //*/
			}
			else if ($(this).is(':radio, :checkbox, select')) {
				elem.on('vp-check change', function () {
					check_errors(errors, requirements, elements) ? button.removeAttr('disabled') : button.attr('disabled', 'disabled');
				});
			}
		});
	};

	$.extend($.fn, {
		/**
		 *
		 * @returns {Array|{index: number, input: string}|*}
		 *  return an array which contains all possible validations on this element
		 */
		vp_external_check: function (connetions_class, operator) {
			if (operator == 'add') {
				$(this).addClass(connetions_class);
			}
			else if (operator == 'remove') {
				$(this).removeClass(connetions_class);
			}
			else {
				$(this).toggleClass(connetions_class);
			}

			$(this).trigger('vp-check');
		},
		findValidation: function () {
			var element = $(this),
				validations,
				classes,
				extra_validation;

			// if data-vpValidations is exists that means this element was validated before.
			if (validations = element.attr_existence_check('data-vpValidations')) {
				return validations.split('|');
			}

			if (!validations) {
				validations = element.findValidationInputClass();
			}

			if (!validations) {
				validations = element.findValidationInputName();
			}

			if (!validations) {
				validations = element.findValidationInputType();
			}

			if (classes = element.attr_existence_check('class')) {
				extra_validation = classes.match(/remain_?Chars/gi);
			}

			var number_validation_required = ['phone', 'national_code', 'number', 'mobile', 'cost', 'price'];
			for (var n = 0; n < number_validation_required.length; n++) {
				if ($.inArray(number_validation_required[n], validations) > -1) {
					validations.push('number');
					break;
				}
			}

			// if we found validations put it on element as a data attribute so we can access theme later faster.
			if (validations || extra_validation) {
				validations = $.isArray(validations) ? validations : [];
				extra_validation = $.isArray(extra_validation) ? extra_validation : [];

				validations = $.merge(validations, extra_validation);
				// change all regex items to their equal words
				var validations_string = validations.join('|');
				validations_string = validations_string.replace(/first_name|last_name|fname|lname|firstname|lastname|surname|family/gi, 'name');
				validations_string = validations_string.replace(/number/gi, 'number');
				validations_string = validations_string.replace(/user_name|userName/gi, 'username');
				validations_string = validations_string.replace(/pass_word|password/gi, 'password');
				//validations_string = validations_string.replace(/mobile/gi, 'password');
				validations_string = validations_string.replace(/tel/gi, 'phone');
				validations_string = validations_string.replace(/cost|price/gi, 'comma');
				validations_string = validations_string.replace(/vp-match\w+/gi, 'match');
				// turn string to array and remove similar array elements
				validations = validations_string.split('|');
				validations = getUnique(validations);

				element.attr('data-vpValidations', validations.join('|'));
			}


			return validations;
		},
		findValidationInputType: function () {
			var element = $(this),
				default_value = ['text'],
				inputType,
				matched,
				classPattern = /(email|number|text|password|url|tel)/gi;

			// if name attr exists, then try to find a match
			if (inputType = element.attr_existence_check('type')) {
				matched = inputType.match(classPattern);
			}

			return matched ? matched : default_value;
		},
		findValidationInputName: function () {
			var element = $(this),
				inputName,
				matched = false,
				classPattern = /(user_?name|email|number|cost|price|text|address|name|fname|lname|first_?name|last_?name|surname|family|pass_?word|pass|url|phone|mobile|tel|national_?code|time)/gi;

			// if name attr exists,
			if (inputName = element.attr_existence_check('name')) {
				matched = inputName.match(classPattern);
			}

			return matched ? matched : false;
		},
		findValidationInputClass: function () {
			var element = $(this),
				classes,
				matched = false,
				classPattern = /(user_?name|url|email|national_?code|number|cost|price|text|((first|last)_?)?name|address|comma|phone|mobile|tel|time|password)Validation|(\bvp-match\w+)|vp-letter-flash/gi;

			// if there is a class attr, then find matched classes
			if ((classes = element.attr_existence_check('class')) && (matched = classes.match(classPattern))) {

				// remove 'Validation' from end of strings
				matched = $.map(matched, function (value) {
					return value.replace('Validation', '');
				});
			}

			return matched;
		},
		/**
		 *
		 * @returns {*|Array|{index: number, input: string}}
		 *   if element has novalidate attribute or noValidation class return true else return false.
		 */
		noValidateElement: function () {
			var element = $(this),
				classes;

			// if element has novalidate attribute or noValidate class return true else return false
			return element.attr_existence_check('novalidate', true) || ((classes = element.attr_existence_check('class')) && classes.match(/noValidate/gi));
		},
		findLanguage: function (default_lang, real) {
			real = real ? real : false;
			var element = $(this),
				classes,
				language = element.attr_existence_check('data-vplanguage');

			// if developer wants real value of input language
			if (real) {
				classes = element.attr_existence_check('class');
				if (!language && classes) {
					if (language = classes.match(/\blang(\w{2})\b/gi)) {
						language = language.shift();
					}
					else {
						language = false;
					}
				}

				return language;
			}
			if (language && !real) {

				return language;
			}

			classes = element.attr_existence_check('class');

			if (!language || classes) {
				if (classes) {
					//language = classes.match(/(\b\w{2,3}-\w{2,3}\b)/gi);
					language = classes.match(/\blang(\w{2})\b/gi);

					if (language) {
						language = language.shift();
					}
					else {
						language = default_lang;
					}
				}
			}

			return language;

		},
		acceptable_chars: function (default_regexp) {
			var result = default_regexp,
				acceptable_chars;
			if (acceptable_chars = $(this).attr_existence_check('data-allowed-chars')) {
				result = new RegExp('[^' + acceptable_chars.replace(/\|/g, '') + ']');
			}

			return result;
		},
		disallow_chars: function (default_regexp) {
			var result = default_regexp,
				disallowed_chars;
			if (disallowed_chars = $(this).attr_existence_check('data-disallowed-chars')) {
				result = new RegExp('[' + disallowed_chars.replace(/\|,/g, '') + ']');
			}

			return result;
		},
		maxlength: function (maxlength) {
			var element = $(this),
				max_length;
			if (max_length = element.attr_existence_check('maxlength')) {
				return max_length;
			}
			else {
				element.attr('maxlength', maxlength);
				return maxlength;
			}
		},
		minlength: function (minlength) {
			var element = $(this),
				min_length;
			if (min_length = element.attr_existence_check('minlength')) {
				return min_length;
			}
			else {
				element.attr('minlength', minlength);
				return minlength;
			}
		},
		val_cursor: function (changeable_value, caretPos) {
			// check to see this element is not radio or checkbox.
			if (!$(this).is('input, textarea') || $(this).is(':radio, :checkbox, :button')) {
				return false;
			}

			// For email number and ... type getCursor function does not work, so we turn their type to text.
			if ($(this).is('[type=email], [type=number]')) {
				$(this).attr('type', 'text');
			}

			var element = $(this),
				value = element.val(),
				cursor_position = element.getCursor();
			if (changeable_value != value) {
				caretPos = caretPos ? caretPos : changeable_value.length;
				cursor_position = cursor_position - (value.length - caretPos);

				element.val(changeable_value);

				element.setCaretPosition(cursor_position);
			}
		},
		getCursor: function () {
			var input = $(this).get(0);
			if (!input) return; // No (input) element found
			if ('selectionStart' in input) {
				// Standard-compliant browsers
				return input.selectionStart;
			} else if (document.selection) {
				// IE
				input.focus();
				var sel = document.selection.createRange();
				var selLen = document.selection.createRange().text.length;
				sel.moveStart('character', -input.value.length);
				return sel.text.length - selLen;
			}
		},
		setCaretPosition: function (caretPos) {
			var elem = $(this).get(0)

			if (elem != null) {
				if (elem.createTextRange) {
					var range = elem.createTextRange();
					range.move('character', caretPos);
					range.select();
				}
				else {
					elem.focus();
					if (elem.selectionStart) {
						elem.setSelectionRange(caretPos, caretPos);
					}
				}
			}
		},
		/**
		 * Check attribute existence, if attribute exists return it else return false;
		 * @param attribute
		 * @param empty_allowed
		 * @returns attributeName | false
		 */
		attr_existence_check: function (attribute, empty_allowed) {
			var attr = $(this).attr(attribute);

			empty_allowed = empty_allowed ? empty_allowed : false;

			if (typeof attr !== typeof undefined) {
				if (attr.length > 0) {
					return attr;
				}
				else if (empty_allowed) {
					return attribute;
				}
			}

			return false;
		},
		get_field_name: function () {
			var id = $(this).attr_existence_check('id'),
				elem_name = null;
			// if id is set look for label
			// if label exists return filtered label
			// else look for placeholder
			// else return "field" string
			if (id && $('[for=' + id + ']').length > 0) {
				// look for label
				elem_name = $('[for=' + id + ']').text().replace(/[^ا-ی\sa-z]/gi, '');
			}
			else if (elem_name = $(this).attr_existence_check('placeholder')) {
				// now elem_name is set and we have nothing to do here.
			}
			else {
				elem_name = 'فیلد';
			}

			return elem_name;
		},
		get_vprange: function () {
			return range_finder($(this).attr_existence_check('data-vprange'));
		},
		get_agerange: function () {
			return range_finder($(this).attr_existence_check('data-agerange'));
		},
		remain_chars_show: function (remainChar_showing, remainCharsNum) {
			var element = $(this),
				$messages = remainChar_showing,
				id = element.attr('data-validationid'),
				messages_tag = 'div',
				element_exists,
				message_tag = 'div',
			// the last part which hold error message text
				message = element_creator(message_tag),
				remain_message;

			// if developer doesn't change the default value of remainCharsShow
			if (!remainChar_showing) {
				// create an element near this element and showing errors on that element
				// if next to this element no div element exists
				if (!(element.next(messages_tag).length > 0)) {
					$messages = element_creator(messages_tag);
					element.after($messages);
				}

				// if next to this element an div element exists`
				else {
					$messages = element.next(messages_tag);
				}
			}

			// if developer change the default value of
			else {
				$messages = $(remainChar_showing);
			}

			// check to see if an element exists which we can show our errors into that element
			element_exists = ($messages.length > 0);

			// filling error variable
			remain_message = error_text_creator({remain: remainCharsNum}, 'remain');

			// work with DOM
			if (element_exists) {
				if (!($messages.find('#' + id).length > 0)) {
					$messages.append(message.text(remain_message).attr('id', id));
				}
				else {
					$messages.find('#' + id).text(remain_message).fadeIn();
				}
			}
		}
	});

	var error_class_check = function (elements) {
		var enable_buttons = true;
		var classes;

		elements.each(function () {
			classes = $(this).attr('class');
			/*$(this).hasClass(function(){});*/
			if (typeof classes != 'undefined' && classes.match(/vp-error.*/gi)) {
				enable_buttons = false;
				return false;
			}
		});

		return enable_buttons;
	};

	var check_errors = function (errors, requirements, elements) {
		return $.isEmptyObject(errors) && check_requirements(requirements) && error_class_check(elements);
	};

	var range_finder = function (ranges) {
		var result = {};
		if (ranges) {
			ranges = ranges.split('-');
			if (ranges[0]) {
				var min_range = ranges.filter(function (value) {
					if (value != '') {
						return value;
					}
				});
				result.min = ranges != '' ? Math.min.apply(null, min_range) : false;
			}

			if (ranges[1]) {
				ranges = ranges.filter(function (value) {
					if (value != '') {
						return value;
					}
				})
				result.max = Math.max.apply(null, ranges);
			}
		}

		return !$.isEmptyObject(result) ? result : false;
	};

	/**
	 * Give a national code and return true/false.
	 *
	 * @param national_code
	 *
	 * @return bool
	 *  return TRUE if this is a real national code
	 *  otherwise return false.
	 */
	var national_code_validation = function (national_code) {
		national_code = national_code.toString();
		var check_national_code = false;
		var nc = national_code.match(/^(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)(\d)$/);
		if (!nc) {
			return check_national_code;
		}
		nc = nc.splice(1, 10);

		if ($.unique(nc.slice()).length < 2) {
			return check_national_code;
		}

		var controller_value = nc.pop();
		var sum = 0;
		for (var key = 0; key < nc.length; key++) {
			sum += ((10 - key) * nc[key]);
		}

		var mod = parseInt(sum) - ((parseInt(sum / 11)) * 11);

		if ((mod == 0 && mod == controller_value) || (mod == 1 && controller_value == 1) || (mod > 1 && controller_value == 11 - mod)) {
			check_national_code = true;
		}

		return check_national_code;
	};

	/**
	 * Validate Email
	 *
	 * @param email
	 * @returns {*}
	 *  return false if email is not valid and return email if it's a valid email
	 */
	var email_validate = function (email) {
		var regexp = /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		//test regexp
		var email_validate = regexp.test(email);

		return !email_validate ? false : email.replace(/^(w{3}\.)/gi, '');
	};

	/**
	 * Validate Url
	 *
	 * @param value
	 * @param validate_regexp
	 * @returns {boolean}
	 */
	var url_validate = function (value, validate_regexp) {
		// Copyright (c) 2010-2013 Diego Perini, MIT licensed
		// https://gist.github.com/dperini/729294
		// see also https://mathiasbynens.be/demo/url-regex
		// modified to allow protocol-relative URLs
		var default_regexp = /^(?:(?:(?:https?|ftp):)?\/\/)?(www.)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
		validate_regexp = validate_regexp ? validate_regexp : default_regexp;
		return validate_regexp.test(value);
	};

	/**
	 * Validate number.
	 * @param number
	 * @returns {boolean}
	 */
	var number_validate = function (number) {
		var regexp = /([^0-9٠-٩,])/gi,
			result = true,
			regexp_test = regexp.test(number);

		if (regexp_test) {
			//playSound();
			result = number.replace(regexp, '')
		}
		return result;
	};

	/**
	 * @param requirements: An object which contains jquery object elements.
	 * @returns {boolean}: return true if all required fields filled correctly, False otherwise.
	 */
	var check_requirements = function (requirements) {
		var enable_button = true;

		requirements.each(function () {
			//if ($(this).is('select')) {
			//}

			if ($(this).is('input, textarea') && $(this).val() == '' || ($(this).is('select') && $(this).val() == '' || $(this).val == '_none')) {
				enable_button = false;
				return false;
			}
			else if ($(this).is(':radio, :checkbox')) {
				//!$(this).is(':checked');
				var name = $(this).attr('name');
				if (!$('[name=' + name + ']').is(':checked')) {
					enable_button = false;
					return false;
				}
			}
		});

		return enable_button;
	};

	var letter_flash_view = function (flash_view, box_value) {
		var element = flash_view.element,
			flash_showing = flash_view.setting.flashShow,
			flash_element_property = flash_view.setting.flashStyle,
			lastChars = flash_view.setting.flashLastChars;

		var flash_tag = 'div',
			$flash,
			id = element.attr_existence_check('data-validationId')
			;

		if (!flash_showing) {
			if (!($('#flash_' + id).length > 0)) {
				$flash = element_creator(flash_tag).css(flash_element_property).attr('id', 'flash_' + id);
				element.after($flash);
			}
			else {
				$flash = $('#flash_' + id);
			}
		}
		else {
			$flash = $(flash_showing);
		}

		$flash
			.html(box_value.slice(-lastChars))
			.fadeIn(200, function () {
				$(this).fadeOut(200);
			});
	};

	var error_handler = function (errors_parameters, tooltip_plugin) {
		var element = errors_parameters.element,
			error_showing = errors_parameters.errorShow,
			errors = errors_parameters.errors,
			errors_addresses = errors_parameters.errors_addresses;
		var $messages = error_showing,
			messages_tag = 'div',
			element_exists,
			message_tag = 'div',
		// The last part which hold error message text
			message = element_creator(message_tag);

		// If error_showing == '' (which is the default state) we must create an element_element for that
		if (!error_showing) {
			// create an element near this element and showing errors on that element
			if (!(element.next(messages_tag).length > 0)) {
				$messages = element_creator(messages_tag);
				element.after($messages);
			}
			else {
				$messages = element.next(messages_tag);
			}
		}
		else {
			$messages = $(error_showing);
		}

		// check to see if an element exists which we can show our errors into that element
		element_exists = ($messages.length > 0);
		var main_text = [];
		var has_no_error = true;
		//console.log('errors_addresses', errors_addresses);
		$.each(errors_addresses, function (index, has_error) {
			//console.log('has_error', has_error);
			// It is a variable that shows us is this error shows before or not? <b>(is this showing error element exists or not?)</b>
			var error_name = index.match(/\B([a-z|A-Z]*)\b/gi).shift(),
				error_message;
			if (typeof tooltip_plugin != 'undefined') {
				var plg_init = tooltip_plugin.plugin_main_method,
					plg_options = tooltip_plugin.plugin_options,
					show_method = tooltip_plugin.show_method,
					hide_method = tooltip_plugin.hide_method,
					plugin_attr_option = tooltip_plugin.plugin_attr_options;
			}
			if (has_error['parameters']) {
				has_no_error = false;
				// fill error variable
				error_message = error_text_creator(has_error['parameters'], error_name);
				errors[index] = error_message;

				if (typeof tooltip_plugin != 'undefined') {
					var text = error_message ? error_message : tooltip_plugin.default_text;
				}

				// work with DOM
				if (element_exists) {
					if (typeof tooltip_plugin != 'undefined') {
						main_text.push(text);
						var end_text = '';
						if (main_text.length > 0) {
							end_text += '<ul class="vp-plugin-integration-msg-' + index + ' ">';
							for (var m = 0; m < main_text.length; m++) {
								end_text += '<li class="' + index + ' ' + has_error['type'] + '" >' + main_text[m] + '</li>';
							}
							end_text += '</ul>';
						}

						element.attr(plugin_attr_option, end_text);
						element[plg_init](plg_options);
						element[plg_init]()[show_method]();

						//element[plg_init](plg_options)[show_method]();
						//element[plg_init]();
					}
					else if (!$('#' + index).length > 0) {
						$messages.append(message.text(error_message).attr('id', index).addClass(has_error['type']));
					}
					else {
						$('#' + index).fadeIn();
					}
					element.addClass('vp-error');
				}

			}
			else {
				if (typeof tooltip_plugin != 'undefined' && has_no_error) {
					//element[plg_init](plg_options);
					element[plg_init]()[hide_method]();
				}
				// remove this index from errors variable
				delete errors[index];
				element.removeClass('vp-error');
				// remove related DOM element
				$('#' + index).remove();
			}
		});

		return errors;
	};

	var error_text_creator = function (values, error_type) {
		var error_message = error_messages(),
			signs = [],
			signs_values = [];

		$.each(values, function (index, value) {
			signs.push(index);
			signs_values.push(value);
		});

		if (typeof error_message[error_type] != typeof undefined) {
			return error_message[error_type].replaceArray(signs, signs_values);
		}
	};

	var error_messages = function () {
		var lang = $('html').attr_existence_check('lang') ? $('html').attr_existence_check('lang') : 'en';
		var error_messages = {
			'en': {
				email: 'field_name value was not correct',
				maxlength: 'field_name can not has more than length characters.',
				minlength: 'field_name can not has less than length characters.',
				exactlength: 'field_name must exactly has length characters.',
				remain: 'remain character remains',
				url: 'field_name must be a url',
				match: 'field_name values is not match',
				agerange: 'You must be between minage and maxage',
				minagerange: 'You can not be younger than minage',
				maxagerange: 'You can not be older than maxage',
				datecheck: 'field_name is not a valid date',
				range: 'field_name value must be between min and max',
				min: 'field_name value must be grater than min',
				max: 'field_name value must be less than max',
				pattern: 'field_name pattern is not a valid one',
				nationalcode: 'field_name must be a valid Iranian national code',
				capslock: 'Your CapsLock is on'
			},
			'fa': {
				email: 'field_name وارد شده صحیح نمی باشد',
				maxlength: 'field_name نباید بیشتر از length حرف باشد',
				minlength: 'field_name نباید کمتر از length حرف باشد',
				exactlength: 'field_name باید length حرف باشد',
				remain: 'remain حرف باقی مانده',
				url: 'field_name وارد شده صحیح نمی باشد',
				match: 'مقادیر field_name یکسان نمی باشد',
				agerange: 'سن شما باید بین minage و maxage سال باشد',
				minagerange: 'حداقل سن قابل پذیرش minage سال می باشد',
				maxagerange: 'سن شما باید کمتر از maxage سال باشد',
				datecheck: 'field_name وارد شده صحیح نمی باشد',
				range: 'field_name باید بین min و max باشد.',
				min: 'field_name باید بزرگتر از min باشد.',
				max: 'field_name باید کوچکتر از max باشد.',
				pattern: 'الگوی field_name صحیح نمی باشد',
				nationalcode: 'field_name وارد شده صحیح نمی باشد',
				capslock: 'Caps lock شما روشن است'
			}
		};

		return error_messages[lang];
	};

	/**
	 * @param string
	 * @param lang
	 * @returns {string|*}
	 */
	var convertLang = function (string, lang) {
		lang = lang ? lang : 'en';
		lang = lang.replace(/-/gi, '_').replace('lang', '').toLowerCase();

		var languages = vp_languages(lang),
			changed_string;

		changed_string = string.split('')
			.map(function (char, index) {
				for (var lnIndex in languages) {
					if (typeof languages[lnIndex][char.charCodeAt(0)] != typeof undefined) {
						char = String.fromCharCode(languages[lnIndex][char.charCodeAt(0)]);
					}
					else if (typeof languages[lnIndex][char.toLowerCase().charCodeAt(0)] != typeof undefined) {
						char = String.fromCharCode(languages[lnIndex][char.toLowerCase().charCodeAt(0)]);
					}
				}
				return char;
			})
			.join("");

		return changed_string;
	};

	/**
	 * Give a tag name and return an element
	 * @param tagName
	 * @returns {*|HTMLElement}
	 */
	var element_creator = function (tagName) {
		return $('<' + tagName + '></' + tagName + '>');
	};

	/**
	 * play a beep sound
	 */
	var playSound = function () {
		var sound = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
		sound.play();
	};

	var vp_languages = function (lang) {
		var default_languages = {
				en_fa: {
					84: 1548,        //  T  =>  ،
					104: 1575,        //  h  =>  "ا"
					102: 1576,        //  f  =>  "ب"
					92: 1662,        //  \  =>  "پ"
					106: 1578,        //  j  =>  "ت"
					101: 1579,        //  e  =>  "ث"
					91: 1580,        //  [  =>  "ج"
					93: 1670,        //  ]  =>  "چ"
					112: 1581,        //  p  =>  "ح"
					111: 1582,        //  o  =>  "خ"
					110: 1583,        //  n  =>  "د"
					98: 1584,        //  b  =>  "ذ"
					118: 1585,        //  v  =>  "ر"
					99: 1586,        //  c  =>  "ز"
					96: 1688,        //  `  =>  "ژ"
					115: 1587,        //  s  =>  "س"
					97: 1588,        //  a  =>  "ش"
					119: 1589,        //  w  =>  "ص"
					113: 1590,        //  q  =>  "ض"
					120: 1591,        //  x  =>  "ط"
					122: 1592,        //  z  =>  "ظ"
					117: 1593,        //  u  =>  "ع"
					121: 1594,        //  y  =>  "غ"
					116: 1601,        //  t  =>  "ف"
					114: 1602,        //  r  =>  "ق"
					59: 1705,        //  ;  =>  "ک"
					39: 1711,        //  '  =>  "گ"
					103: 1604,        //  g  =>  "ل"
					108: 1605,        //  l  =>  "م"
					107: 1606,        //  k  =>  "ن"
					44: 1608,        //  ,  =>  "و"
					105: 1607,        //  i  =>  "ه"
					100: 1740,        //  d  =>  "ی"
					109: 1574,        //  m  =>  "ئ"
					72: 1570,       //  H  =>  "آ"
					67: 1688,        //  C  =>  "ژ"
					// numbers
					48: 1632,        //  0  =>  "٠"
					49: 1633,        //  1  =>  "١"
					50: 1634,        //  2  =>  "٢"
					51: 1635,        //  3  =>  "٣"
					52: 1636,        //  4  =>  "٤"
					53: 1637,        //  5  =>  "٥"
					54: 1638,        //  6  =>  "٦"
					55: 1639,        //  7  =>  "٧"
					56: 1640,        //  8  =>  "٨"
					57: 1641        //  9  =>  "٩"
				},
				fa_en: {
					1575: 104,        //  "ا"  =>  h
					1576: 102,        //  "ب"  =>  f
					1578: 106,        //  "ت"  =>  j
					1579: 101,        //  "ث"  =>  e
					1581: 112,        //  "ح"  =>  p
					1582: 111,        //  "خ"  =>  o
					1583: 110,        //  "د"  =>  n
					1584: 98,        //  "ذ"  =>  b
					1585: 118,        //  "ر"  =>  v
					1586: 99,        //  "ز"  =>  c
					1587: 115,        //  "س"  =>  s
					1588: 97,        //  "ش"  =>  a
					1589: 119,        //  "ص"  =>  w
					1590: 113,        //  "ض"  =>  q
					1591: 120,        //  "ط"  =>  x
					1592: 122,        //  "ظ"  =>  z
					1593: 117,        //  "ع"  =>  u
					1594: 121,        //  "غ"  =>  y
					1601: 116,        //  "ف"  =>  t
					1602: 114,        //  "ق"  =>  r
					1604: 103,        //  "ل"  =>  g
					1605: 108,        //  "م"  =>  l
					1606: 107,        //  "ن"  =>  k
					1607: 105,        //  "ه"  =>  i
					1740: 100,        //  "ی"  =>  d
					1574: 109,        //  "ئ"  =>  m
					// Capital english letters
					1617: 70,        //  ّّ   =>  F
					1600: 74,        //  ـ  =>  J
					1613: 69,        //  ٍ   =>  E
					92: 80,        //  \  =>  P
					91: 79,        //  [  =>  O
					1571: 78,        //  أ  =>  N
					1573: 66,        //  إ  =>  B
					1572: 86,        //  ؤ  =>  V
					1615: 83,        //  ُ   =>  S
					1614: 65,        //  َ   =>  A
					1612: 87,        //  ٌ   =>  W
					1611: 81,        //  ً   =>  Q
					1610: 88,        //  ي  =>  X
					1577: 90,        //  ة  =>  Z
					//44: 85,        //  ,  =>  U
					1563: 89,        //  ؛  =>  Y
					1548: 84,        //  ،  =>  T
					1728: 71,        //  ۀ  =>  G
					187: 76,        //  »  =>  L
					171: 75,        //  «  =>  K
					93: 73,        //  ]  =>  I
					1616: 68,        //  ِ   =>  D
					1569: 77,        //  ء  =>  M
					//1585: 82,        //  ريال  =>  R
					1688: 67,        //  ژ  =>  C
					1570: 72,        // "آ" =>  H
					// signs
					1662: 92,        //  "پ"  =>  \
					1580: 91,        //  "ج"  =>  [
					1670: 93,        //  "چ"  =>  ]
					1705: 59,        //  "ک"  =>  ;
					1711: 39,        //  "گ"  =>  '
					1608: 44,        //  "و"  =>  ,
					// numbers
					1632: 48,       //  "٠"  =>  0
					1633: 49,        //  "١"  =>  1
					1634: 50,        //  "٢"  =>  2
					1635: 51,        //  "٣"  =>  3
					1636: 52,        //  "٤"  =>  4
					1637: 53,        //  "٥"  =>  5
					1638: 54,        //  "٦"  =>  6
					1639: 55,        //  "٧"  =>  7
					1640: 56,        //  "٨"  =>  8
					1641: 57        //  "٩"  =>  9
				},
				en_hi: {
					113: 2379,
					119: 2375,
					101: 2381,
					114: 2367
				}
			},
			languages;


		vp_extra_language = (typeof vp_extra_language != typeof undefined && !$.isEmptyObject(vp_extra_language)) ? vp_extra_language : {};

		languages = $.extend(default_languages, vp_extra_language);
		var langs = Object.keys(languages);
		var regexp = new RegExp('_' + lang + '$');
		var useable_langs = [];
		$.map(langs, function (value) {
			if (value.match(regexp)) {
				useable_langs[value] = languages[value];
			}
		});

		return useable_langs;
	};

	var loadScript = function (url, callback) {
		// Adding the script tag to the head as suggested before
		var body = $('body');
		var attributes = {
			type: 'text/javascript',
			src: url
		};
		var script = $('<script></script>').attr(attributes);

		// Then bind the event to the callback function.
		// There are several events for cross browser compatibility.
		script.onreadystatechange = callback;
		script.onload = callback;

		// Fire the loading
		body.append(script);
	};

	var getUnique = function (entered_array) {
		var u = {}, a = [];
		for (var i = 0, l = entered_array.length; i < l; ++i) {
			if (u.hasOwnProperty(entered_array[i])) {
				continue;
			}
			a.push(entered_array[i]);
			u[entered_array[i]] = 1;
		}
		return a;
	};

	/**
	 * Get a String and a mask template and put mask on that string.
	 *
	 * @param str
	 * @param mask
	 * @param persist If persist either string is empty or not, it shows Mask always.
	 * @returns {{str: *, caretPos: *}}
	 */
	var mask_fn = function (str, mask, persist) {
		var indexes = [];
		var indexes_length = 0;
		var indexes_keys = [];

		$.each(mask.split(""), function (index, value) {
			if (value != '_') {
				indexes_length++;
				indexes[index] = value;
			}
		});

		if (str.length > (mask.length - indexes_length)) {
			str = str.substr(0, mask.length - indexes_length);
		}

		var replacement_value;
		// Put mask over input value.
		for (var j in indexes) {
			replacement_value = indexes[j];
			if (j < str.length) {
				str = string_splice(str, parseInt(j), 0, replacement_value);
			}
		}
		var caretPos = str.length;

		if (persist && str.length < mask.length) {
			str += mask.substr(str.length, mask.length);
			str = str.replace(/_/gi, ' ');
			//caretPos = $.inArray(str.indexOf(' ') - 1, indexes_keys) != -1 ? str.indexOf('_') - 1 : str.indexOf('_');
		}

		return {
			str: str,
			caretPos: caretPos
		};
	};

	var cleanArray = function (actual) {
		var newArray = new Array();
		for (var i = 0; i < actual.length; i++) {
			if (actual[i] || actual[i] != '') {
				newArray.push(actual[i]);
			}
		}
		return newArray;
	};

	var string_splice = function (string, idx, rem, str) {
		return string.slice(0, idx) + str + string.slice(idx + Math.abs(rem));
	};

	var age_calc = function (persian_date) {
		if (persian_date.replace(' ', '').length != 10) {
			return {
				year: -1
			};
		}

		// Find mod
		var mod = persian_date.replace(/\d|\s/gi, '')[0];

		// split function returns string elements. We change them to integer
		var persian_date_array = $.map(persian_date.split(mod), function (value) {
			return parseInt(value);
		});

		var birth_date = persianDate(persian_date_array);
		var now = persianDate();
		var year = now.diff(birth_date, 'years', true);
		// TODO:: I want to calculate month and day

		return {
			year: year
		}
	};

	var check_date = function (persian_date) {
		var result = true;
		var mod = persian_date.replace(/\d|\s/gi, '')[0];

		// split function returns string elements. We change them to integer
		var persian_date_array = $.map(persian_date.split(mod), function (value) {
			return parseInt(value);
		});

		// check month
		if (persian_date_array.length != 3) {
			result = false;
		}
		else if (persian_date_array[1] > 12 || persian_date_array[1] < 1) {
			result = false;
		}
		else if (persian_date_array[2] > persianDate([persian_date_array[0], persian_date_array[1]]).daysInMonth()) {
			result = false;
		}

		return result;
	};

	var isCapslock = function (e) {

		e = (e) ? e : window.event;

		var charCode = false;
		if (e.which) {
			charCode = e.which;
		} else if (e.keyCode) {
			charCode = e.keyCode;
		}

		var shifton = false;
		if (e.shiftKey) {
			shifton = e.shiftKey;
		} else if (e.modifiers) {
			shifton = !!(e.modifiers & 4);
		}

		if (charCode >= 97 && charCode <= 122 && shifton) {
			return true;
		}

		if (charCode >= 65 && charCode <= 90 && !shifton) {
			return true;
		}

		//console.log('caps is of');

		return false;

	}

	String.prototype.replaceArray = function (find, replace) {
		var replaceString = this;
		for (var i = 0; i < find.length; i++) {
			replaceString = replaceString.replace(find[i], replace[i]);
		}
		return replaceString;
	};
})(jQuery);

/****************
 Ideas:
 TODO: We can create rules object which can be extensible by users.
 TODO: We can let users add some exampleValidation class to our rules dynamically.
 TODO: (done) Url check, (done) date time check, (done) only accept special characters, (done) do not accept some characters.
 ****************/
