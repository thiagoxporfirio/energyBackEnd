import e, { Request, Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { Cliente } from "../entity/Clientes";
import { DetalheConsumo } from "../entity/DetalheConsumo";
import { Fatura } from "../entity/Fatura";
import {
	extractDataFromPdf,
	parseReferenceDate
} from "../../config/PdfExtractor";
import fs from "fs";
import path from "path";

export async function uploadAndProcessFaturas(
	request: Request,
	response: Response
) {
	try {
		const { file }: any = request;

		if (!file) {
			return response.status(400).send("Nenhum arquivo enviado.");
		}

		// Save PDF file to the server
		const pdfDirectory = path.join(__dirname, "../../uploads");
		if (!fs.existsSync(pdfDirectory)) {
			fs.mkdirSync(pdfDirectory, { recursive: true });
		}
		const pdfFileName = `${Date.now()}_${file.originalname}`;
		const pdfPath = path.join(pdfDirectory, pdfFileName);
		fs.writeFileSync(pdfPath, file.buffer);

		// Generate URL for the PDF
		const pdfUrl = `http://localhost:3333/uploads/${pdfFileName}`;

		const extractedData = await extractDataFromPdf(file.buffer);

		const detalhes = extractedData[0].detalhes;

		console.log("Detalhes:", detalhes);

		const clienteRepository = AppDataSource.getRepository(Cliente);
		const faturaRepository = AppDataSource.getRepository(Fatura);
		const detalheConsumoRepository =
			AppDataSource.getRepository(DetalheConsumo);

		if (!Array.isArray(extractedData)) {
			return response
				.status(500)
				.send("Erro ao processar: Dados extraídos não são iteráveis.");
		}

		for (const data of extractedData) {
			let cliente = await clienteRepository.findOneBy({
				numero_cliente: data.numeroCliente
			});
			if (!cliente) {
				cliente = clienteRepository.create({
					numero_cliente: data.numeroCliente
				});
				await clienteRepository.save(cliente);
			}

			const faturaExistente = await faturaRepository.findOne({
				where: {
					cliente: cliente,
					mes_referencia: data.mesReferencia
				}
			});

			if (faturaExistente) {
				return response.status(400).json({
					message: `Fatura para o cliente ${data.numeroCliente} e mês de referência ${data.mesReferencia} já existe.`
				});
			}

			const fatura = faturaRepository.create({
				cliente: cliente,
				mes_referencia: data.mesReferencia,
				total_kwh: data.detalhes.reduce(
					(sum, item) => sum + item.quantidadeKwh,
					0
				),
				total_valor: data.detalhes.reduce((sum, item) => sum + item.valor, 0),
				data_emissao: parseReferenceDate(data.mesReferencia),
				url_pdf: pdfUrl
			});

			await faturaRepository.save(fatura);

			for (const item of data.detalhes) {
				const detalhe = detalheConsumoRepository.create({
					fatura: fatura,
					tipo_consumo: item.tipo,
					quantidade_kwh: item.quantidadeKwh || 0,
					valor: item.valor
				});
				await detalheConsumoRepository.save(detalhe);
			}
		}

		return response.status(201).json({
			message: "Faturas processadas e salvas com sucesso."
		});
	} catch (error) {
		console.error("Erro ao processar a fatura:", error);
		return response.status(500).send("Internal Server Error");
	}
}

export async function getDashboardData(request: Request, response: Response) {
	try {
		const numeroCliente = request.query.numeroCliente as string;

		if (!numeroCliente) {
			return response
				.status(400)
				.send("Parâmetro 'numeroCliente' é obrigatório.");
		}

		const clienteRepository = AppDataSource.getRepository(Cliente);
		const faturaRepository = AppDataSource.getRepository(Fatura);

		const cliente = await clienteRepository.findOne({
			where: { numero_cliente: numeroCliente }
		});

		if (!cliente) {
			return response.status(404).send("Cliente não encontrado.");
		}

		const faturas = await faturaRepository.find({
			where: { cliente_id: cliente.id },
			relations: ["detalhes_consumo"]
		});

		const dashboardData = faturas.map(fatura => {
			const energiaEletrica = fatura.detalhes_consumo.find(
				detalhe => detalhe.tipo_consumo === "Energia Elétrica"
			);
			const energiaSCEE = fatura.detalhes_consumo.find(
				detalhe => detalhe.tipo_consumo === "Energia SCEE ISENTA"
			);
			const energiaCompensada = fatura.detalhes_consumo.find(
				detalhe => detalhe.tipo_consumo === "Energia compensada GD I"
			);
			const contribIlumPublica = fatura.detalhes_consumo.find(
				detalhe => detalhe.tipo_consumo === "Contrib Ilum Publica Municipal"
			);

			const consumoEnergiaEletrica =
				(energiaEletrica?.quantidade_kwh || 0) +
				(energiaSCEE?.quantidade_kwh || 0);
			const valorTotalSemGD =
				(energiaEletrica?.valor || 0) +
				(energiaSCEE?.valor || 0) +
				(contribIlumPublica?.valor || 0);
			const economiaGD = energiaCompensada?.valor || 0;

			return {
				mesReferencia: fatura.mes_referencia,
				consumoEnergiaEletrica,
				energiaCompensada: energiaCompensada?.quantidade_kwh || 0,
				valorTotalSemGD,
				economiaGD
			};
		});

		return response.json(dashboardData);
	} catch (error) {
		console.error("Erro ao obter dados do dashboard:", error);
		return response.status(500).send("Internal Server Error");
	}
}
