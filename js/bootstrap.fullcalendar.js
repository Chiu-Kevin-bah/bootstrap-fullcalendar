/*!
 * Name: FullCalendar (Bootstrap Extended)
 * Date: 12/08/2015
 * Author: Kevin Chiu [chiukk1@gmail.com]
 */
(function($) {
	var FC = $.fullCalendar,
			Calendar = FC.Calendar,

			fnFC = $.fn.fullCalendar,

			// Default Option Overrides
			settings = {
				buttonIcons: {
					prev: 'ion ion-arrow-left-b',
					next: 'ion ion-arrow-right-b'
				},

				header: {
					left: 'prev,next today',
					center: 'title',
					right: 'month,agendaWeek,agendaDay'
				},

				unselectAuto: false,

				// Extension Options
				buttonClass: 'btn-primary',
				colors: [
					'#F44336','#E91E63','#9D27B0','#673AB7','#3F51b5','#2196F3','#03A9F4','#00BDD4',
					'#009688','#4DAF50','#8BD34A','#DDDD39','#FFEB3B','#FFD107','#FF9800','#FF5722',
					'#795548'
				],

				sources: {},
				popup: {
					titleFormat: 'MMMM DD, YYYY',
					sources: {},
					form: {
						'Event Time': '<input type="text" class="form-control timepicker" name="eventTime" />',
						'Description': '<textarea class="form-control name="description"></textarea>'
					},

					save: function() { },
					cancel: function() {},
					show: function() {},
					hide: function() {},
				}
			},

			methods = {};

	// Inject Bootstrap classes
	methods.viewRender = function(view, element) {
		var options = this.options,

				$buttonGroups = $('.fc-button-group'),
				$buttons = $('.fc-button'),
				$today = $('.fc-today'),

				$popup = $([
					'<div class="modal fade modal-fullcalendar">',
						'<div class="modal-dialog">',
							'<div class="modal-content">',
								'<div class="modal-header">',
									'<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
									'<h4 class="modal-title"></h4>',
								'</div>',
								'<div class="modal-body">',
									'<form class="form form-fullcalendar form-validate">',
									'</form>',
								'</div>',
								'<div class="modal-footer text-center">',
									'<button type="button" class="btn btn-default" data-button="cancel" data-dismiss="modal">Close</button>',
									'<button type="button" class="btn btn-servpal" data-button="save">Save</button>',
								'</div>',
							'</div>',
						'</div>',
					'</div>'
				].join(''));

		$buttonGroups.addClass('btn-group');

		$buttons
			.addClass('btn')
			.removeClass('active disabled');

		$buttons.filter('.fc-state-active').addClass('active');
		$buttons.filter('.fc-state-disabled').addClass('disabled');

		if(options.buttonClass) {
			$buttons.addClass(options.buttonClass);
		}

		$today.addClass('alert-info');

		this.popup = $popup.appendTo('body');
	};

	/*-----------------------*/
	/*--- Closure Methods ---*/
	/*-----------------------*/
	function fetchSourceOptions(source) {
		var items = [],
				ajaxOptions = {
					method: 'POST',
					dataType: 'json',
					async: false
				},

				keys = {
					value: 'value',
					text: 'text'
				},

				item = '<option value="[value]"[attr]>[text]</option>';

		if(source !== undefined) {
			if(typeof source == 'object') {
				ajaxOptions = $.extend(true, source, ajaxOptions);
			} else if(typeof source == 'string') {
				ajaxOptions.url = source;
			}

			if(source.keys !== undefined && typeof source.keys == 'object') {
				$.extend(keys, source.keys);
			}

			$.ajax(ajaxOptions)
				.done(function(data) {
					var value,
							text,
							selected = (source.keys.selected || ''),
							intData;

					for(intData = 0; intData < data.length; intData++) {
						value = data[intData][keys.value] || '';
						text = data[intData][keys.text] || '';

						items.push(
							item
								.replace(/\[value\]/g, value)
								.replace(/\[text\]/g, text)
								.replace(/\[attr\]/g, (selected == value) ? ' selected="selected"' : '')
						);
					}
				});
		}

		return items.join('');
	}

	function initForm($popup, items, sources, title) {
		var form = [],
				name,
				label,
				item,
				itemOptions,

				$timepicker;

		if(typeof items == 'object') {
			for(label in items) {
				item = items[label];
				name = $(item).attr('name');

				// Get remote options
				if($(item).is('select')) {
					itemOptions = fetchSourceOptions(sources[name]);
					item = $('<div><div>')
						.append($(item).html(itemOptions))
						.html();
				}

				// Build form input
				form.push(
					'<div class="form-group">',
						'<label>'+label+'</label>',
						'<div>',
							item,
						'</div>',
					'</div>'
				);
			}
		} else if(typeof items == 'array') {
			items.forEach(function(intItem, item) {
				name = $(item).attr('name');

				// Get remote options
				if($(item).is('select')) {
					itemOptions = fetchSourceOptions(sources[name]);
					item = $('<div><div>')
						.append($(item).html(itemOptions))
						.html();
				}

				// Build form input
				form.push(
					'<div class="form-group">',
						'<label></label>',
						'<div>',
							item,
						'</div>',
					'</div>'
				);
			});
		}

		// Update Popup body contents
		$popup
			.find('.modal-header .modal-title')
			.html(title);
		$popup
			.find('.modal-body form')
			.html(form.join(''));

		$timepicker = $popup.find('.timepicker');

		if($timepicker.length) {
			$timepicker.timepicker({
				scrollDefault: 'now',
				step: 10,
				timeFormat: 'h:iA'
			});

			$timepicker.timepicker('setTime', new Date());
		}
	}

	/*--------------------------*/
	/*--- Events & Callbacks ---*/
	/*--------------------------*/
	// Show Event Add
	methods.dayClick = function(date, jsEvent, view) {
		var options = view.calendar.options,
				popOptions = options.popup,
				$calendar = view.el.closest('.fullcalendar');

				$body = $('body'),
				$popup = view.popup,

				title = date.format(popOptions.titleFormat);

		initForm($popup, popOptions.form, popOptions.sources, title);

		if(typeof popOptions.show == 'function')
			$body.on('fullcalendar::popup::show', popOptions.show);
		if(typeof popOptions.hide == 'function')
			$body.on('fullcalendar::popup::hide', popOptions.hide);
		if(typeof popOptions.save == 'function')
			$body.on('fullcalendar::popup::save', popOptions.save);
		if(typeof popOptions.cancel == 'function')
			$body.on('fullcalendar::popup::cancel', popOptions.cancel);

		// Popup "show" event
		$popup.on('shown.bs.modal', function() {
			$body.triggerHandler('fullcalendar::popup::show', [$popup, $calendar]);
		});

		// Popup "hide" event
		$popup.on('hidden.bs.modal', function() {
			$calendar.triggerHandler('fullcalendar::popup::hide', [$popup, $calendar]);
		});

		$popup.modal();

		// Popup "save" event
		$body.on('click', '.modal-fullcalendar:first button[data-button="save"]', function(e) {
			e.stopPropagation();
			$body.triggerHandler('fullcalendar::popup::save', [$(this), $popup, $calendar]);
		});

		// Popup "cancel" event
		$body.on('click', '.modal-fullcalendar:first button[data-button="cancel"]', function(e) {
			e.stopPropagation();
			$body.triggerHandler('fullcalendar::popup::cancel', [$(this), $popup, $calendar]);
		});

		return;
	}

	// Show Event Edit
	/*
	methods.eventClick = function(event, jsEvent, view) {
		console.log([event, jsEvent, view]);
		return;
	}
	*/
	// Implement Callback Extensions
	$.fn.fullCalendar = function(options) {
		var args = Array.prototype.slice.call(arguments, 1),
				res = this,
				key,
				option;

		for(key in options) {
			option = options[key];

			if(typeof option == 'object') {
				options[key] = $.extend({}, settings[key], options[key]);
			}
		}

		this.each(function(i, _element) {
			var callbacks = ['viewRender', 'dayClick', 'eventClick'],
					$element = $(_element),
					calendar = $element.data('fullCalendar'),
					callback
					name;

			function isCallback(name) {
				return (
					(typeof options === 'object') &&
					options.hasOwnProperty(name) &&
					$.isFunction(options[name])
				);
			}

			for(key in methods) {
				callback = options[key];
				options[key] = methods[key];
			}
		});

		fnFC.call(this, options);
	}

	$.extend(true, Calendar, { defaults: settings });
}(jQuery));
/*
function renderCalendar(min, max, slot) {
	var time = {
				min: min || '00:00:00',
				max: max || '24:00:00'
			},

			slotToDisplay = (slot === undefined) ? '00:10:00'  : slot;    // if slot is undefined then use default slot timing      

	if($calendar.length) {
		$calendar.otxFullCalendar('destroy')
		$calendar.otxFullCalendar({
			slotDuration: slotToDisplay,
			minTime: time.min,
			maxTime: time.max
			editable: true,
		});
	}
}
*/