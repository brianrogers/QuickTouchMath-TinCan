function getCircleColor(avgtime){
	console.log('getCircleColor'+avgtime);
	switch(avgtime){
		case '1':
			return 'green';
		case '2':
			return 'yellow';
		case '3':
			return 'orange';
		case '4':
			return 'red';
		default:
			return '';
	};
}

$(document).ready(function(){
	$('.circle').each(function(){
		console.log('adding class' + getCircleColor($(this).text()));
		$(this).addClass(getCircleColor($(this).text()));
		console.log($(this));
	});

	$('.reportBlock').click(function(){
		window.location = window.location + '?group='+$(this).attr('id');
	});
});


