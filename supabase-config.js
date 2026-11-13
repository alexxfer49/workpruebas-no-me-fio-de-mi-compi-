// Datos de conexión con Supabase
var SUPABASE_URL = "https://jxgslpapfwsiygupwdzv.supabase.co";
var SUPABASE_KEY = "sb_publishable_umY4coBasOXtdUtgzUj5CA_Zo_HurAT";

// Crear conexión con Supabase
var clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);
