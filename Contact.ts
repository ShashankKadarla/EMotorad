import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ type: 'enum', enum: ['primary', 'secondary'], default: 'primary' })
  linkPrecedence!: 'primary' | 'secondary';

  @Column({ nullable: true })
  linkedId?: number; // Explicitly storing linked contact ID

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Contact, (contact) => contact.secondaryContacts, { nullable: true })
  @JoinColumn({ name: 'linkedId' }) // Ensures linkedId is explicitly mapped
  linkedContact?: Contact;


  @OneToMany(() => Contact, (contact) => contact.linkedContact)
  secondaryContacts!: Contact[];
}
