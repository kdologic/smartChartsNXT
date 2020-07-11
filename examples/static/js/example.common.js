/* eslint-disable */ 

function generateRandomTimeSeries(startDate, count, range) {
  for (var i = 0, dataSet = []; i < count;i++) {
    var seed = Math.round(Math.random()*100) || 1, loop = 0;
    var rval = Math.random();
    for(var loop = 0; loop < seed; loop++) {
      rval = Math.random();
    }
    var sd = startDate;
		var val = Math.floor(rval * (range.max - range.min + 1)) + range.min;
    dataSet.push({label: sd,value: val});
    startDate += 864e5;
	}
	return dataSet
}