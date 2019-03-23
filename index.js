const https = require('https');

const delay = parseInt(process.argv[2]) || 1000
const parallelsCount = parseInt(process.argv[3]) || 3
const termLength = parseInt(process.argv[4]) || 3


console.log("call",parallelsCount,"bf search at the same time, pause", delay, "ms", "term length", termLength)

start(callBF, delay)

async function start(work, delay){
        let totalDuration = 0
	let i = 1
	while(true){
		let minDuration = Infinity
		let maxDuration = -Infinity
		await wait(delay)
		try{
			const allResult = await work()
			allResult.forEach(function(result){
				totalDuration += result.duration
				minDuration = Math.min(result.duration, minDuration)
				maxDuration = Math.max(result.duration, maxDuration)
				console.log(i,result.duration,"ms", result.res.statusCode, "length:", result.data.length, "term:", result.term)
			})
			console.log("MIN", minDuration, "AVG", Math.round(totalDuration / (i*parallelsCount)), "MAX", maxDuration)
		}catch(e){
			console.error(e)
		}
		i++
	}
}

function callBF(){
	const parallels = []
	for(let i = 0; i < parallelsCount; i++){
		parallels.push(getAJob())
	}
	return Promise.all(parallels)
}

function getAJob(){
	return new Promise(call)
}

function call(resolve, reject){
	const term = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0,termLength)
	const url = `https://blueforest.org/api/tree/trunks?q=${term}&ps=20`
	let data = ""
	const tStart = new Date().getTime()
	https.get(url, (res) => {
	  res.setEncoding('utf8');
	  res.on('data', (d) => {
	    data += d
	  });

	res.on('end', function(){
		const duration = new Date().getTime() - tStart
		resolve({data:data, res:res, url: url, term:term, duration: duration})
	})

	}).on('error', reject);

}

function wait(duration){
	return new Promise(function(resolve){
		setTimeout(function(){resolve()}, duration)
	})
}
