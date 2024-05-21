import pdf from "pdf-parse";

export function parseReferenceDate(mesReferencia: string): Date {
	if (!mesReferencia) {
		throw new Error("Mês de referência não fornecido ou inválido.");
	}
	const monthNames = [
		"JAN",
		"FEV",
		"MAR",
		"ABR",
		"MAI",
		"JUN",
		"JUL",
		"AGO",
		"SET",
		"OUT",
		"NOV",
		"DEZ"
	];
	const parts = mesReferencia.split("/");
	const month = monthNames.indexOf(parts[0]);
	const year = parseInt(parts[1], 10);

	return new Date(year, month, 1);
}

export async function extractDataFromPdf(dataBuffer): Promise<any> {
	const data = await pdf(dataBuffer);
	const text = data.text.replace(/\s+/g, ' ');

	console.log("Texto extraído:", text);

	const numeroClienteRegex = /Nº DO CLIENTE[\s:]*([0-9]+)/;
	const numeroClienteMatch = text.match(numeroClienteRegex);
	const numeroCliente = numeroClienteMatch ? numeroClienteMatch[1] : undefined;

	const dataEmissaoMatch = text.match(/Data de emissão: (\d{2}\/\d{2}\/\d{4})/);
	let mesReferencia;

	if (dataEmissaoMatch) {
		const dataEmissao = new Date(dataEmissaoMatch[1]);
		const monthNames = [
			"JAN",
			"FEV",
			"MAR",
			"ABR",
			"MAI",
			"JUN",
			"JUL",
			"AGO",
			"SET",
			"OUT",
			"NOV",
			"DEZ"
		];
		mesReferencia = `${monthNames[dataEmissao.getMonth()]}/${dataEmissao.getFullYear()}`;
	}

	// Detalhes de consumo
	const detalhes = [];

	// Energia Elétrica
	const energiaEletricaRegex = /Energia Elétrica\s+kWh\s+(\d+)\s+([\d,.]+)/;
	let matches = text.match(energiaEletricaRegex);
	if (matches) {
		detalhes.push({
			tipo: "Energia Elétrica",
			quantidadeKwh: parseFloat(matches[1].replace(",", ".")),
			valor: parseFloat(matches[2].replace(",", "."))
		});
	}

	// Energia SCEEE ISENTA
	const energiaSCEEERegex = /Energia SCEEE ISENTA\s+kWh\s+(\d+)\s+([\d,.]+)/;
	matches = text.match(energiaSCEEERegex);
	if (matches) {
		detalhes.push({
			tipo: "Energia SCEEE ISENTA",
			quantidadeKwh: parseFloat(matches[1].replace(",", ".")),
			valor: parseFloat(matches[2].replace(",", "."))
		});
	}

	// Energia compensada GD I
	const energiaGDRegex = /Energia compensada GD I\s+kWh\s+(\d+)\s+([\d,.]+)/;
	matches = text.match(energiaGDRegex);
	if (matches) {
		detalhes.push({
			tipo: "Energia compensada GD I",
			quantidadeKwh: parseFloat(matches[1].replace(",", ".")),
			valor: parseFloat(matches[2].replace(",", "."))
		});
	}

	// Contrib Ilum Publica Municipal
	const contribIlumRegex = /Contrib Ilum Publica Municipal\s+([\d,.]+)/;
	matches = text.match(contribIlumRegex);
	if (matches) {
		detalhes.push({
			tipo: "Contrib Ilum Publica Municipal",
			quantidadeKwh: 0, // Não aplica quantidade para este tipo
			valor: parseFloat(matches[1].replace(",", "."))
		});
	}

	return [
		{
			numeroCliente,
			mesReferencia,
			detalhes: [...detalhes]
		}
	];
}
