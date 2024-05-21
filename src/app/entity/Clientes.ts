import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Fatura } from "./Fatura";

@Entity("clientes")
export class Cliente {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    numero_cliente: string;

    @OneToMany(() => Fatura, fatura => fatura.cliente)
    faturas: Fatura[];
}