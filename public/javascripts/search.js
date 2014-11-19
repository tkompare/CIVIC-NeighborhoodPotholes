$(document).ready(function() {
	$('#potholesearch').bootstrapValidator({
		feedbackIcons: {
			required: 'glyphicon glyphicon-asterisk',
			valid: 'glyphicon glyphicon-ok',
			invalid: 'glyphicon glyphicon-remove',
			validating: 'glyphicon glyphicon-refresh'
		},
		fields: {
			areas: {
				validators: {
					callback: {
						message: 'Please choose a Community Area or Ward',
						callback: function(value, validator) {
							return checkGroupEmpty(value, validator);
						}
					}
				}
			},
			ward: {
				validators: {
					callback: {
						message: 'Please choose a Community Area or Ward',
						callback: function(value, validator) {
							return checkGroupEmpty(value, validator);
						}
					}
				}
			}
		}

	});
});

function checkGroupEmpty(value, validator) {
	var $groups = $('#potholesearch').find('.validation-group-1'),
			total   = $groups.length;
	// If all elements are empty, then return false
	if ($groups.filter(function() {
				return $(this).val() === '';
			}).length === total)
	{
		return false;
	} else {
		// Update the status of this validator to all fields
		$groups.each(function() {
			validator.updateStatus($(this).attr('name'), validator.STATUS_VALID, 'callback');
		});

		// Otherwise, returns true
		return true;
	}
};
