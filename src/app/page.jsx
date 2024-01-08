
import Link from "next/link";

/*
columns:
header: header bir string veya bir number alır tablo başlığı olarak kullanılır.
dt_name: bu value başlığın datadan hangi key ile veri çekeceğini belirtir bir string alır.
sortable: bu başlık altındaki veriler sıralamaya tabi tutulacak mı? sıralama olacak mı?
filter: "include" yada "equal" alır içerisinde olması yeterli mi yoksa eşit mi olacak bunu kontrol eder.
enableForm: Data ekleme modalında görünecek mi (bir input olarak)
type: Data ekleme modalında olan inputun type'ını belirtir "text", "email", "number" vb...
translate: Data ekleme modalında ki ekstra dil ekleme özelliklerini kullanacak mı?
hide: true ise tabloda görünmez.
columnFilter: select ile bir filterlama işlemi yapılacak mı?
cell: () => {}, bir component alır içerisine ve bu headerın altındaki verilerde bu component'ı kullanır tüm datayı props olarak alır.

lang: dillerin datasını alır
initial_dt: başlangıç için bir veri seti alır
perPage: eğerki paginaation true ise her sayfada kaç adet gösterileceğini alır
pagination: true ise sayfalı false ise tek sayfada gösterir.
paginationType: "load" veya "page" alır sayfalar geçişlimi yoksa load more butonu ile aşağı doğru kayarak mı sayfalanacak?
defaultLang: langs datasındaki code valusunu alır (!!ana dil için!!)
 */
function Home(){
    return (
        <main className="min-h-screen p-8 w-screen flex items-center justify-center">
            <div className="container flex gap-5 "> 
              
              <Link href={"/store"} >Add Store</Link>
              <Link href={"/Addperson"} >Add Person</Link>
              <Link href={"/Stock"} >Add Stock</Link>
              <Link href={"/Stockcontrol"} >Stock Control</Link>
                
            </div>
        </main>
    )
}

export default Home