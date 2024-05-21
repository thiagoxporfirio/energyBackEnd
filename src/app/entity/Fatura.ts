import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { Cliente } from "./Clientes";
import { DetalheConsumo } from "./DetalheConsumo";

@Entity("faturas")
export class Fatura {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cliente, cliente => cliente.faturas)
    @JoinColumn({ name: "cliente_id" })
    cliente: Cliente;

    @Column()
    cliente_id: number;

    @Column()
    mes_referencia: string;

    @Column("decimal", { precision: 10, scale: 2 })
    total_kwh: number;

    @Column("decimal", { precision: 10, scale: 2 })
    total_valor: number;

    @Column({ type: "date" })
    data_emissao: Date;

    @OneToMany(() => DetalheConsumo, detalhe => detalhe.fatura)
    detalhes_consumo: DetalheConsumo[];
}