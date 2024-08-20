class VanillaDatatable {
    constructor({ url, datatable_id, columns }) {
        this.url = url;
        this.datatable_id = datatable_id;
        this.columns = columns; // Espera um objeto com alias e exibição
    }

    async init() {

        let div_datatable = document.getElementById(this.datatable_id)

        let search_field = document.createElement('input')
        search_field.setAttribute('type', 'text')
        search_field.setAttribute('id', 'search_field')
        search_field.addEventListener('keyup', () => {
            this.search(this.url)
        })

        div_datatable.appendChild(search_field)

        let table = document.createElement('table')
        table.classList.add('datatable_table')

        let table_container = document.createElement('div')
        table_container.classList.add('datatable_table_container')
        table_container.appendChild(table)

        div_datatable.appendChild(table_container)

        let thead = document.createElement('thead')

        table.appendChild(thead)

        let thead_tr = document.createElement('tr')

        thead.appendChild(thead_tr)

        let tbody = document.createElement('tbody')

        table.appendChild(tbody)

        Object.keys(this.columns).forEach(col => {
            let th = document.createElement('th')
            th.classList.add('datatable_th')
            th.innerText = col
            thead_tr.appendChild(th)
        })

        await this.search(this.url)
    }

    async render(data, links, columns) {

        document.querySelector('tbody').innerHTML = ''
        data.forEach(row => {
            let tr = document.createElement('tr')

            Object.keys(columns).forEach(column => {
                let td = document.createElement('td')
                th.classList.add('datatable_td')
                td.innerText = row[column]
                tr.appendChild(td)
            })
            document.querySelector('tbody').appendChild(tr)
        })

        if (!document.getElementById('pagination_container')) {
            let pagination_container = document.createElement('div')
            pagination_container.setAttribute('id', 'pagination_container')
            document.getElementById('datatable').appendChild(pagination_container)
        }

        document.getElementById('pagination_container').innerHTML = ''

        links.forEach(link => {
            let pagination_btn = document.createElement('button')
            pagination_btn.innerText = link.label
            document.getElementById('pagination_container').appendChild(pagination_btn)

            pagination_btn.addEventListener('click', () => {
                this.search(link.url)
            })
        })

        document.getElementById(this.datatable_id).appendChild(pagination_container)
    }

    async search(url) {

        const token = document.querySelector('meta[name="csrf-token"]').content
        let search = null

        if (document.getElementById('search_field')) {
            search = document.getElementById('search_field').value
        }

        const req = await fetch(url, {
            method: 'post',
            headers: {
                'x-csrf-token': token,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                search: search
            })
        })
        const res = await req.json()

        this.render(res.data, res.links, this.columns)
    }
}


