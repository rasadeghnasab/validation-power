Jquery Validation Plugin
====================


This is a multilingual jquery validation plugin which will can easilly validate your **HTML Forms**. You can do many validations base on your needs by just adding this plugin to your forms and simply call it from script, this **plugin** can either **configure** from adding some <i>HTML Attributes</i> to form elements or <i>passing object to plugin calling</i> fuction.

----------
Dependencies
--------------------
[jquery.js](http://jquery.org/) 1.4 >
[persian.date.js](http://babakhani.github.io/PersianWebToolkit/doc/persiandate/0.1.8/) 0.1.6 > **(If you want to use jalali calendar)**
[persian-datepicker.js](http://babakhani.github.io/PersianWebToolkit/doc/datepicker/0.4.5/) 0.1.8 > **(If you want to use jalali calendar)**


----------
Quick Start
----------------

You can quickly validate a form by just attach validationPower plugin to the form, and if you have some html5 validation roles attributes on your html the plugin uses those attributes as best as possible.

    <!DOCTYPE html>
    <html>
    <head>
    	<link rel="stylesheet" href="css/persian-datepicker-0.4.5.min.css">
    	<script src="js/jquery.min.js"></script>
		<script src="js/persian-date-0.1.8.min.js"></script>
		<script src="js/persian-datepicker-0.4.5.min.js"></script>
		<script src="js/jquery.validation-power.js"></script>
    </head>
    <body>
	    <form>
		    <input type="text" name="first_name" required placeholder="First name">
		    <input type="number" name="account_num" placeholder="Account #num" maxlength="30" "required"="required"/>
		    <input type="email" name="email" value="">
	    </form>

	<script type="text/javascript">
		$(document).ready(function(){
			$('form').validationPower();
		});
	</script>
    </body>
    </html>


----------
Validation starts
-------------------------
We have various number of validation out of the box, so basically we cover many users needs easilly.
Here we have been listed all validation that we covered:

 - **Requiered**: force input to has a value and disable submit button and prevent form submitting if this input has no value.

 - User just can enter value in a **specific language**. To do that we can add a class to the input like this:
	 - `<input class="langFa" />` <i>//user just can enter persian</i>
	 - in this example if user keyboard was setted to 'en' and user start typing each characters which user entered converted to the equivalent one on 'fa' keyboard layout.
	 - Sometimes you want to all input be in a specific language and you want to make this work by single command, to do that you can add a property to plugin options object. <i>next line:</i>
	 - `$('...').validationPower({ language_letters: 'langEn', language_num: 'langFa'});` <i>We separate letters and numbers language in order to you have more control on input fields.</i> **Note**: By default these two set on `LangEn`
	 - In some situations you want to user can enter value in an input field in any languange, even combination of multi language on this situation you can add `data-no-lang` attribute to the field attributes.

 - Just enter valid **names**: you can restrict users to just enter names on an input in these ways:
	 1. `<input name="name|family|surname|fname|fistname|first_name|lname|lastname|last_name" />`
	 2. `<input class="firstnameValidation|first_nameValidation|lastnameValidation|last_nameValidation"/>`

 - Just enter valid **username**: you can restrict users to just enter username on an input, <i>user just can enters values which is acceptable for username field like letters, numbers, undescros and dash</i>.
	 1. `<input name="username|user_name"/>`
	 2. `<input class="usernameValidation|user_nameValidation"/>`

 - Just enter valid **email**: check the value to be a valid email address.
	 1. `<input type='email' />`
	 2. `<input name='email'/>`
	 3. `<input class='emailValidation'/>`

> **Caution:** this just email by email text and  do not check email validity over the internet.

 - **Numeric** field: You can set an input field to accept just numerical values.
	1. `<input type='number'/>`
	2. `<input name='number' />`
	3. `<input class='numberValidation' />`
 - **Mobile/phone/tel**:  You have two different <i>(actually phone and tel are the same)</i> validation method for phone and mobile number. The difference between **mobile** and **phone/tel** is the mobile numbers must started with <i>09</i> and if user start typing anything but <i>09</i> in your input field the plugin append a <i>09</i> to the entered value But the phone/tel number has no restriction on itself.
	 1. `<input type='tel' />`
	 2. `<input name='mobile|phone|tel'/>`
	 3. `<input class='mobileValidation|phoneValidation|telValidation'/>`
 - **Url**: check entered value to be a valid url:
	 1. `<input type='url' />`
	 2. `<input name='url' />`
	 3. `<input class='urlValidation' />`


> **Note**: valid url is folloing this patterns,
> 1. http://www.domain.com
> 2. http://domain.com
> 3. www.domain.com
> 4. domain.com

 - **National code**:  check to see the entered value is a valida national code.
 	 1. `<input name='nationalcode|national_code' />`
 	 2. `<input class='nationalcodeValidation|national_codeValidation' />`

> **Caution**: This validation is just for [Iranian](https://en.wikipedia.org/wiki/Iran) native national code and works with their national code compution formula.

- **Comma**: This validation allow user to put comma to the input field even it has a number validation. for example if you have a price field and you want user only can enter numbers and those numbers separated by commas, then you must add commaValidation class to input.
		1. `<input class='commaValidation'>`

> **Note**: numbers separated by **,** on every **3 digits**.

 - **Price/cost**: These validations force a field to just accepts **number** and then separate numbers on every 3 digit.
		1. `<input name='price|cost'>`
		2. `<input class='priceValidation|costValidation'>`

> **Trick <i class='icon-magic'></i>:** You can simulate price/cost validation by using  combination of two validation which are <i>numberValidation</i> & <i>commaValidation</i>

 - **Time**: This validation adds tooltip calendar to input.
	 1. `<input name='time' />`
	 2. `<input class='timeValidation' />`

 - **Address**:  Address validation method allow user to just enter characters which those are normally use in addresses and some characters like `@_;«»` and so on are not valid to enter in addresses inputs.
	 1. `<input name='address' />`
	 2. `<input class='addressValidation' />`

 - **Text**: Text validation is the most simplest validation on input fields it just simply prevent user from entring invalid special characters like **'** or  **"** .

 - **Password**: Password validation has absolutely no validation on field value <i>[It also removes all valiadtion on the field if anything exists]</i>.
 - **Pattern control**: You can use html pattern attribute to define a pattern for user input and prevent wrong values base on pattern and we add proper error message to the validation.
	 	 1. `<input pattern='^09\d{9}$' />` <i>e.g. This pattern check value to starts with **09** and has **9 digit** after that</i>

 - **Maxlength and minlength**: limit min and max number of character which user can input.
		 1. `<input maxlength='40' minlength='10' />`
		 2. plugin options has two property to set default length of all fields `{fieldMaxLength: 35, fieldMinLength:0}` we can change the max and min length of all fields at once by changing these values (and then we can change each input field min,max length individually by minlength, maxlength property.

> **Note**: If maxlength and minlength are equal, plugin check the input field length to exactly equal to their value, and the error message changes to `$FieldName must has exactly $lenght character` and it doesn't return error message for maxlength and minlenght separately.
>
> **Trick <i class='icon-magic'></i>**: If minlength value is greater than maxlength value, we swap them and then minlenght would be maxlenght and reverse.

 - **Data-allowed-chars**:  This attribute allowed user to **ONLY** enter specified characters into field and not any character colud be entered in the field.
	 1. `<input data-allowed-chars="a,b,f,g,1,2">`. <i>In this example user only can enter `a,b,f,g,1,2` characters, considering that there is no other validation exists on the input.</i>
	 2. `<input class="numberValidation" data-disallowed-chars="a,b,f,g,1,2">`. <i>In this example user can enter only `1,2`, considering that `numberValidation` exists on the field.

> **Note**: Allowed characters separated by `,`

 - **Data-disallowd-chars**: This reduce some characters from valid characters list.

	 1. `<input data-disallowed-chars="a,b,f,g,1,2">`. <i>In this example did not allow to enter `a,b,f,g,1,2` and can enter anything else.</i> note that this input field has **text** validation at least, by default.
	 2. `<input class="numberValidation" data-disallowed-chars="1,2">`. <i>In this example user can enter any number but `1,2`.</i>
> **Note**: Disallowed characters separated by `,`

