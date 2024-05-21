export function loggerInfo(message: string) {
	console.log("INFO - " + new Date().toLocaleString() + " - " + message);
}

export function loggerInfoItem(message: string, item: any) {
	console.log("INFO - " + new Date().toLocaleString() + " - " + message, item);
}

export function loggerErrorItem(message: string, item: any) {
	console.log("ERROR - " + new Date().toLocaleString() + " - " + message, item);
}

export function loggerError(message: string) {
	console.log("ERROR - " + new Date().toLocaleString() + " - " + message);
}

export function loggerWarnItem(message: string, item: any) {
	console.log(
		"Warning - " + new Date().toLocaleString() + " - " + message,
		item
	);
}

export function loggerWarn(message: string) {
	console.log("Warning - " + new Date().toLocaleString() + " - " + message);
}
