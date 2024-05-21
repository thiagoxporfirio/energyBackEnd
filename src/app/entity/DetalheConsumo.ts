import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Fatura } from "./Fatura";

@Entity("detalhes_consumo")
export class DetalheConsumo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Fatura, fatura => fatura.detalhes_consumo)
    @JoinColumn({ name: "fatura_id" })
    fatura: Fatura;

    @Column()
    fatura_id: number;

    @Column()
    tipo_consumo: string;

    @Column("decimal", { precision: 10, scale: 2 })
    quantidade_kwh: number;

    @Column("decimal", { precision: 10, scale: 2 })
    valor: number;
}