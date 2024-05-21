import { Request, Response } from "express";
import { AppDataSource } from "../../database/data-source";
import { Cliente } from "../entity/Clientes";
import { DetalheConsumo } from "../entity/DetalheConsumo";
import { Fatura } from "../entity/Fatura";
import {
	extractDataFromPdf,
	parseReferenceDate
} from "../../config/PdfExtractor";

export async function uploadAndProcessFaturas(
	request: Request,
	response: Response
) {
	try {
		const { file }: any = request;

		if (!file) {
			return response.status(400).send("Nenhum arquivo enviado.");
		}

		const extractedData = await extractDataFromPdf(file.buffer);
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
			console.log("Dados extraídos para processamento:", data);

			let cliente = await clienteRepository.findOneBy({
				numero_cliente: data.numeroCliente
			});
			if (!cliente) {
				cliente = clienteRepository.create({
					numero_cliente: data.numeroCliente
				});
				await clienteRepository.save(cliente);
			}

			const fatura = faturaRepository.create({
				cliente: cliente,
				mes_referencia: data.mesReferencia,
				total_kwh: data.detalhes.reduce(
					(sum, item) => sum + item.quantidadeKwh,
					0
				),
				total_valor: data.detalhes.reduce((sum, item) => sum + item.valor, 0),
				data_emissao: parseReferenceDate(data.mesReferencia)
			});

			console.log("Fatura a ser salva:", fatura);
			await faturaRepository.save(fatura);

			for (const item of data.detalhes) {
				const detalhe = detalheConsumoRepository.create({
					fatura: fatura,
					tipo_consumo: item.tipo,
					quantidade_kwh: item.quantidadeKwh || 0, // Assegura que undefined se torne 0
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
