import { Request, Response } from "express";
import prisma from "../../../utils/prisma";
import bcrypt from "bcryptjs";

export interface CreateUser {
  email: string;
  password: string;
  name: string;
  departmentId: number
}

const createUser = async (req: Request<CreateUser>, res: Response) => {
  const { email, password, name, departmentId } = req.body as CreateUser;
  const departmentIdNumber = parseInt(String(departmentId), 10);

  const userExists = await prisma.user.findUnique({ where: { email } });
  const departmentExists = await prisma.department.findUnique({
    where: { id: departmentIdNumber },
  });

  if (userExists) {
    return res.status(400).json({ error: "O usuário já existe." });
  }

  if (!departmentExists) {
    return res
      .status(400)
      .json({ error: `O departamento com id ${departmentIdNumber} não existe.` });
  }

  
  try {
    const hash_password = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hash_password,
        name,
        departments: {
          create: {
            department: {
              connect: { id: departmentIdNumber },
            },
          },
        },
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar o usuário" });
  }

  return res.status(200).json({ message: "Usuário criado com sucesso" });
};

export default createUser;