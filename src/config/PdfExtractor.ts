import pdf from "pdf-parse";

export function parseReferenceDate(mesReferencia: string): Date {
	const monthNames = {
		JAN: 0,
		FEV: 1,
		MAR: 2,
		ABR: 3,
		MAI: 4,
		JUN: 5,
		JUL: 6,
		AGO: 7,
		SET: 8,
		OUT: 9,
		NOV: 10,
		DEZ: 11
	};

	const [mes, ano] = mesReferencia.split("/");
	const date = new Date(parseInt(ano), monthNames[mes], 1);
	return date;
}

export async function extractDataFromPdf(dataBuffer) {
	const data = await pdf(dataBuffer);
	const text = data.text.replace(/\s+/g, " ");

	const numeroClienteRegex = /Nº DA INSTALAÇÃO\s+(\d+)/;
	const numeroClienteMatch = text.match(numeroClienteRegex);
	const numeroCliente = numeroClienteMatch
		? numeroClienteMatch[1]
		: "Número não encontrado";

	const dataEmissaoRegex = /Data de emissão: (\d{2}\/\d{2}\/\d{4})/;
	const dataEmissaoMatch = text.match(dataEmissaoRegex);
	let mesReferencia = "Data não encontrada";
	if (dataEmissaoMatch) {
		const dataEmissaoParts = dataEmissaoMatch[1].split("/");
		const mes = parseInt(dataEmissaoParts[1], 10);
		const ano = dataEmissaoParts[2];
		const meses = [
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
		mesReferencia = `${meses[mes - 1]}/${ano}`;
	}

	const detalhes = [];
	const consumoPatterns = [
		{
			tipo: "Energia Elétrica",
			regex: /Energia ElétricakWh\s+(\d+)\s+([\d,\.]+)\s+([\d,\.]+)/
		},
		{
			tipo: "Energia SCEE ISENTA",
			regex: /Energia SCEE ISENTAkWh\s+(\d+)\s+([\d,\.]+)\s+([\d,\.]+)/
		},
		{
			tipo: "Energia compensada GD I",
			regex: /Energia compensada GD IkWh\s+(\d+)\s+([\d,\.]+)\s+(-?[\d,\.]+)/
		},

		{
			tipo: "Contrib Ilum Publica Municipal",
			regex: /Contrib Ilum Publica Municipal\s+([\d,\.]+)/
		}
	];

	consumoPatterns.forEach(pattern => {
		const matches = text.match(pattern.regex);
		if (matches) {
			if (pattern.tipo === "Contrib Ilum Publica Municipal") {
				detalhes.push({
					tipo: pattern.tipo,
					quantidadeKwh: 0,
					valor: parseFloat(matches[1].replace(".", "").replace(",", "."))
				});
			} else {
				detalhes.push({
					tipo: pattern.tipo,
					quantidadeKwh: parseFloat(matches[1].replace(",", ".")),
					precoUnit: parseFloat(matches[2].replace(",", ".")),
					valor: parseFloat(matches[3].replace(".", "").replace(",", "."))
				});
			}
		} else {
			console.log(`Dados não encontrados para o tipo: ${pattern.tipo}`);
		}
	});

	const extractedData = [
		{
			numeroCliente,
			mesReferencia,
			detalhes: [...detalhes]
		}
	];

	return extractedData;
}
