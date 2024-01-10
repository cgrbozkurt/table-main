'use client'
import {useCallback} from "react";
import {arrayBufferToString} from "next/dist/server/app-render/action-encryption-utils";

// Tablo işlevlerini içeren bir özel kancayı oluşturdum
export const TableFunctions = ({
                                   columns,
                                   visible,
                                   data,
                                   filters,
                                   pagination,
                                   page,
                                   sorting,
                                   setFilters,
                                   setSorting,
                                   setSelection,
                                   isSelectedAll
                               }) => {

    // Headerları filterlar ve filterlanmış datayı return eder
    const getHeaders = useCallback(() => {
        return columns
            // eğer ki header'ın hide valuesu false ise geçmesine izin ver eğerki true ise geçişini engelle bu şekilde gizli başlıklar oluşturuluyor
            .filter((col) => !col.hide)
            // visible statinde bu başlık var ise veya hiç tanımlı değilse geçmesine izin ver eğerki hi tanımlı ve false ise geçişine izin verme
            .filter((col) => visible[col.dt_name.toLowerCase()] ?? true);
    }, [columns, visible]);

    // Filterları istediğimiz yerde istediğimiz data uygulamak için bir fonksiyon içerisine bir object alır ve tablo component'ının içerisinde ki filter state'i içerisinde ki global ve column değerlerini kullanarak filterlama işlemlerini uygular
    const applyFilters = useCallback(
        (item) => {

            // datada ki tüm valueları gezer ve 1 tanesinde bile bir eşleşme var ise true olarak döner.
            const globalSearch = () =>
                Object.values(item).some((value) =>
                    value.toString().toLowerCase().includes(filters.global.toLowerCase())
                );

            // dışarıdan başlık ismi ve o başlıkta aranacak kelimeyi alır eğerki başlığın filterType'ı include ise içerisinde o string var mı bunu arar eğer ki equal ise eşitlik sağlıyor mu buna bakar.
            const columnSearch = (columnName, filterValue) => {
                const column = columns.find((col) => col.dt_name === columnName);
                if (column) {
                    const filterType = column.filter;

                    if (filterType === "include") {
                        return item[columnName].toLowerCase().includes(filterValue.toLowerCase());
                    } else if (filterType === "equal") {
                        return item[columnName].toLowerCase() === filterValue.toLowerCase();
                    }
                }
                return true;
            };

            // eğer ki global search'den ve column search'den geçebilirse bu fonksiyondan true döner, return : boolean
            return (
                globalSearch() &&
                filters.columns.every((colFilter) =>
                    columnSearch(
                        Object.keys(colFilter)[0],
                        colFilter[Object.keys(colFilter)[0]]
                    )
                )
            );
        },
        [filters, columns]
    );

    // Ham datayı filterlardan geçirerek kullanılacak datayı almak için bir fonksiyon
    const getRows = useCallback(() => {
        let filteredData = data;

        // Filtreleri uygula
        filteredData = filteredData.filter((item) => applyFilters(item));

        // Sıralamayı uygula
        if (sorting.id && sorting.value) {
            const column = columns.find((col) => col.header === sorting.id);
            if (column) {
                const comparator = (a, b) => {
                    const aValue = a[column.dt_name];
                    const bValue = b[column.dt_name];
                    return sorting.value === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
                };

                filteredData = filteredData.sort(comparator);
            }
        }

        // Sayfalama uygula
        if (pagination) {
            filteredData = filteredData.slice(
                page.pageIndex * page.pageSize,
                (page.pageIndex + 1) * page.pageSize
            );
        }

        return filteredData;
    }, [data, pagination, applyFilters, page, sorting, columns]);

    // Belirli bir sütun için benzersiz değerleri almak için bir fonksiyon
    const getUniqueValues = (columnName, data) => {
        // new Set() ile verinin içerisinde aynı stringlerin olmasını engelliyoruz
        const uniqueValues = new Set();

        data
            .forEach((item) => {
            if (item[columnName] !== undefined) {
                uniqueValues.add(item[columnName].toString().toLowerCase());
            }
        });

        // uniqueValues verisini bir arraya çevir ve return et
        return Array.from(uniqueValues);
    };

    // Belirli bir sütundaki benzersiz değerleri almak için bu fonksiyonu kullanıyoruz. getUniqueValues fonksiyonunu kullanıyor
    const uniqueValues = (columnName) => {
        const uniqueValuesByColumn = {};

        uniqueValuesByColumn[columnName] = getUniqueValues(columnName, data);

        return uniqueValuesByColumn[columnName];
    };

    // name: column name, val: column filter value, bu fonksiyon column search kısmındaki select in her value değişikliğinde çalışacak olan fonksiyon.
    const changeFilter = (name, val) => {
        // eğer ki seçilen value all ise filter datamın içerisinden o kısmı tamamen çıkar
        // eğer ki seçilen value all değil ise datanın içereisinde ki [name] in valuesunu value ya eşitle yani ->  [name]: value

        setFilters((prevFilters) => {
            const updatedColumns = prevFilters.columns.filter(
                (col) => Object.keys(col)[0] !== name
            );

            const withoutAllFilter = updatedColumns.filter(
                (col) => Object.values(col)[0] !== null
            );

            const newColumns =
                val !== "all"
                    ? [...withoutAllFilter, {[name]: val}]
                    : withoutAllFilter

            return {
                ...prevFilters,
                columns: newColumns,
            };
        });
    };

    // tüm verinin içerisinde gez ve hepsinin selectiondaki değerini hepsi zaten seçili ise false değil ise true yap
    const selectAll = (val) => {
        const filteredRows = getRows();
        const newSelection = {};

        if (isSelectedAll()) {
            // If already selected, unselect all filtered rows
            filteredRows.forEach((row, index) => {
                newSelection[index] = false;
            });
        } else {
            // If not already selected, select all filtered rows
            filteredRows.forEach((row, index) => {
                newSelection[index] = true;
            });
        }

        setSelection(newSelection);
    }

    // sıralanabilir bir columna tıklanıldığında asc ise desc desc ise asc yapmak için var bu fonksiyon
    const changeSorting = (column) => {
        if (column?.header !== sorting?.id) {
            setSorting({
                id: column.header,
                value: "asc",
            });
        } else if (column?.header === sorting?.id) {
            setSorting((prevState) => ({
                ...prevState,
                value: prevState?.value === "asc" ? "desc" : "asc",
            }));
        }
    }

    // Dışa açılan fonksiyonları döndür
    return {
        uniqueValues,
        getHeaders,
        getRows,
        applyFilters,
        changeFilter,
        changeSorting,
        selectAll
    };
};

const role = "ADMIN"

/*
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
 */


// Test için kullanılan sütunlar




export const StoreColumn = [
    {
        header: "ID",
        dt_name: "id",
        sortable: true,
        enableForm:false
    },
    {
        header: "Store Name",
        dt_name: "store_name",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
   
    {
        header: "State",
        dt_name: "state",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "premium_rate_maximum",
        dt_name: "premium_rate_maximum",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    {
        header: "discount_rate",
        dt_name: "discount_rate",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    {
        header: "Date",
        dt_name: "date",
        filter: "include",
        enableForm: true,
        type: "date",
        translate: true,
        hide: role === "ADMIN" ? true : false

    },
    {
        header: "Country",
        dt_name: "country",
        filter: "equal",
        enableForm: true,
        type: "text",
        columnFilter: true,
        translate: true,
    },
]

export const personelColumn=[
    {
        header: "ID",
        dt_name: "id",
        sortable: true,
        enableForm: false
    },
    {
        header: "İsim",
        dt_name: "İsim",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }
    ,
    {
        header: "Soy İsim",
        dt_name: "Soy İsim",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }
    ,
    {
        header: "Yaş",
        dt_name: "Yaş",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }
    ,
    {
        header: "Telefon",
        dt_name: "Telefon",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }
    ,
    {
        header: "Adres",
        dt_name: "Adres",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }
    ,
    {
        header: "İndirim Oranı Max",
        dt_name: "İndirim Oranı Max",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }
    ,
    {
        header: "Maaş",
        dt_name: "Maaş",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }
    ,
    {
        header: "Prim",
        dt_name: "Prim",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }
    ,
    {
        header: "Yönetici Yorumu",
        dt_name: "Yönetici Yorumu",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }
    ,
    {
        header: "Personel Rolü",
        dt_name: "Personel Rolü",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true,
        columnFilter: true,

        hide: role === "ADMIN" ? false : true
    }
    ,
    {
        header: "Mağaza Bilgisi",
        dt_name: "Mağaza Bilgisi",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true,
        columnFilter: true,

        hide: role === "ADMIN" ? false : true
    }
    ,
    {
        header: "Ekleme Tarihi",
        dt_name: "date",
        filter: "include",
        enableForm: true,
        type: "date",
        translate: true,

    }
  
]

export const StockColumn = [
    {
            header: "ID",
            dt_name: "id",
            sortable: true
    },
    {
        header: "Mağaza",
        dt_name: "store_name",
        filter: "include",
        enableForm: true,
        type:"text" ,
        translate: true,
        columnFilter: true,
        

    },
    {
        header: "Ürün",
        dt_name: "product",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true,
        columnFilter: true,

    },
    {
        header: "Stok",
        dt_name: "piece",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true,

    },
    {
        header: "Ekleme Tarihi",
        dt_name: "date",
        filter: "include",
        enableForm: true,
        type: "date",
        translate: true,

    },

]

export const companyColumn=[
    {
        header: "ID",
        dt_name: "id",
        sortable: true,
        enableForm:false
    },
    {
        header: "Yetkili İsmi",
        dt_name: "yetkili",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "Firma İsmi",
        dt_name: "firma",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "Telefon 1 ",
        dt_name: "tel1",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }, 
    {
        header: "Telefon 2",
        dt_name: "tel2",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    {
        header: "email1 1",
        dt_name: "email1",
        filter: "include",
        enableForm: true,
        type: "email",
        translate: true
    },
    {
        header: "email 2",
        dt_name: "email2",
        filter: "include",
        enableForm: true,
        type: "email",
        translate: true
    },
    {
        header: "Adres",
        dt_name: "adress",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Vergi Numarası",
        dt_name: "vergino",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    {
        header: "Banka",
        dt_name: "banka",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Banka Hesap Numarası",
        dt_name: "bankahesapno",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    {
        header: "Banka MFO",
        dt_name: "bankamfo",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "IBAN",
        dt_name: "iban",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "Banka",
        dt_name: "banka",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "ekstra1",
        dt_name: "ekstra1",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "ekstra2",
        dt_name: "ekstra2",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },
    {
        header: "ekstra3",
        dt_name: "ekstra3",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    },


]

export const suplierColumn=[
    {
        header: "ID",
        dt_name: "id",
        sortable: true,
        enableForm:false
    },
    {
        header: "yetkiliisim1",
        dt_name: "yetkiliisim1",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "yetkilitelefon1",
        dt_name: "yetkilitelefon1",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }, {
        header: "yetkiliemail1",
        dt_name: "yetkiliemail1",
        filter: "include",
        enableForm: true,
        type: "email",
        translate: true
    }, {
        header: "yetkiliisim2",
        dt_name: "yetkiliisim2",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "yetkilitelefon2",
        dt_name: "yetkilitelefon2",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }, {
        header: "yetkiliemail2",
        dt_name: "yetkiliemail2",
        filter: "include",
        enableForm: true,
        type: "email",
        translate: true
    }, {
        header: "firma",
        dt_name: "firma",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "adres",
        dt_name: "adres",
        filter: "include",
        enableForm: true,
        type: "text",
        translate: true
    }, {
        header: "vergino",
        dt_name: "vergino",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    }, {
        header: "sirkettel",
        dt_name: "sirkettel",
        filter: "include",
        enableForm: true,
        type: "number",
        translate: true
    },
    , {
        header: "sirketemail",
        dt_name: "sirketemail",
        filter: "include",
        enableForm: true,
        type: "email",
        translate: true
    },
]