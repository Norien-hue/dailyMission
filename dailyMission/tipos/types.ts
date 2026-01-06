export type Usuario = {
  idUsuario: number;
  name: string;
  passwd: string;
  exp: number;
  foto: string | null;
  fechaRegistro: string;
};

export type Mision = {
  idMision: number;
  tituloMision: string;
  textoMision: string;
  experenciaMision: number;
};

export type MisionHecha = {
  idKey: number;
  idUsuario: number;
  idMision: number;
  fecha: string;
  fotoMision: string | null;
};

export type AuthUser = {
  id: number;
  name: string;
  exp: number;
  foto: string | null;
};