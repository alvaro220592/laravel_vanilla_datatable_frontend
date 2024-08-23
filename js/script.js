class VanillaDatatable {
    constructor({ url, datatable_id, columns, per_page, searchable, pagination, sorting }) {
        this.url = url;
        this.datatable_id = datatable_id;
        this.columns = columns; // Espera um objeto com alias e exibição
        this.per_page = per_page
        this.searchable = searchable
        this.pagination = pagination
        this.sorting = sorting
        this.sort_direction = null
        this.sort_colum = null
    }

    async init() {

        let div_datatable = document.getElementById(this.datatable_id)

        let datatable_header = document.createElement('div')
        datatable_header.classList.add('datatable_header')

        if (this.searchable.visible == true) {
            this.render_search(datatable_header)
        }

        if (this.per_page.visible == true) {
            this.render_per_page(datatable_header)
        }

        div_datatable.appendChild(datatable_header)

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

        this.columns.forEach(col => {
            let th = document.createElement('th')
            th.classList.add('datatable_th')
            th.innerHTML = col.label
            th.dataset.column_name = col.name

            if (col.sortable == true) {
                this.render_sort_button(th)
            }
            thead_tr.appendChild(th)
        })

        await this.search(this.url)
    }

    render_sort_button(th){
        let sorting_btn = document.createElement('button')
        sorting_btn.classList.add('sorting_btn')
        sorting_btn.innerHTML = this.sorting.types.default.label
        sorting_btn.dataset.sort_direction = 'asc'

        sorting_btn.addEventListener('click', (event) => {

            document.querySelectorAll('.sorting_btn').forEach(item => {
                if (item !== event.currentTarget) {
                    item.innerHTML = this.sorting.types.default.label
                }
            })

            if(this.sort_direction == null){
                this.sort_direction = 'asc'
                sorting_btn.innerHTML = this.sorting.types.asc.label
            }
            else if(this.sort_direction == 'asc'){
                this.sort_direction = 'desc'
                sorting_btn.innerHTML = this.sorting.types.desc.label
            }
            else if(this.sort_direction == 'desc'){
                this.sort_direction = null
                sorting_btn.innerHTML = this.sorting.types.default.label
            }

            // definindo a coluna para ordenação
            if (this.sort_direction != null) {
                this.sort_colum = sorting_btn.closest('th').dataset.column_name
            } else {
                this.sort_colum = null
            }

            this.search(this.url);
        })

        th.appendChild(sorting_btn)
    }

    render_per_page (datatable_header) {
        let per_page_container = document.createElement('div')
        per_page_container.setAttribute('id', 'per_page_container')
        let per_page_field = document.createElement('select')
        per_page_field.setAttribute('id', 'per_page_field')
        let per_page_options_values = this.per_page.options_values

        per_page_options_values.forEach(i => {
            let per_page_field_option = document.createElement('option')
            per_page_field_option.value = i
            per_page_field_option.innerText = i
            per_page_field.appendChild(per_page_field_option)
        })

        if (this.per_page.all.visible == true) {
            let per_page_field_option = document.createElement('option')
            per_page_field_option.value = 'all'
            per_page_field_option.innerText = this.per_page.all.label
            per_page_field.appendChild(per_page_field_option)
        }

        per_page_field.addEventListener('change', () => {
            this.search(this.url)
        })

        let per_page_text = document.createElement('span')
        per_page_text.innerHTML = `<span>${this.per_page.label}</span>`
        per_page_container.appendChild(per_page_text)
        per_page_container.appendChild(per_page_field)

        datatable_header.appendChild(per_page_container)
    }

    render_search(datatable_header){
        let search_field_container = document.createElement('div')
        search_field_container.setAttribute('id', 'search_field_container')

        if (this.searchable.label && this.searchable.label != '') {
            let search_field_label = document.createElement('label')
            search_field_label.setAttribute('for', 'search_field')
            search_field_label.innerHTML = this.searchable.label
            search_field_container.appendChild(search_field_label)
        }

        let search_field = document.createElement('input')
        search_field.setAttribute('type', 'text')
        search_field.setAttribute('placeholder', this.searchable.placeholder)
        search_field.setAttribute('id', 'search_field')
        search_field.addEventListener('keyup', () => {
            this.search(this.url)
        })

        search_field_container.appendChild(search_field)
        datatable_header.appendChild(search_field_container)
    }

    render_pagination(links, total){
        let per_page = document.getElementById('per_page_field').value

        if (this.pagination.showing_x_of_y.visible == true) {
            let showing_x_of_y_container = document.createElement('div')
            showing_x_of_y_container.innerHTML = this.pagination.showing_x_of_y.label.replace('{perpage}', per_page).replace('{total}', total)
            document.getElementById('pagination_container').appendChild(showing_x_of_y_container)
        }

        links.forEach(link => {
            let pagination_btn = document.createElement('button')

            if (this.pagination.buttons.type == 'minimal') {
                if (!(link.label.includes('Previous') || link.label.includes('Next'))) {
                    return
                }
            }

            if (link.label.includes('Next')) {
                link.label = this.pagination.buttons.next.label
            }

            if (link.label.includes('Previous')) {
                link.label = this.pagination.buttons.previous.label
            }

            if (link.active) {
                pagination_btn.classList.add('pagination_btn_active')
            }

            pagination_btn.innerHTML = link.label
            pagination_btn.classList.add('pagination_btn')

            if (!link.url) {
                pagination_btn.disabled = true
            } else {
                pagination_btn.disabled = false
            }

            pagination_btn.addEventListener('click', (event) => {
                if (link.url) {
                    this.search(link.url)
                }
            })

            document.getElementById('pagination_container').appendChild(pagination_btn)
        })
    }

    async render(data, links, columns, total) {

        document.querySelector('tbody').innerHTML = ''
        data.forEach(row => {
            let tr = document.createElement('tr')

            columns.forEach(column => {
                let td = document.createElement('td')
                td.classList.add('datatable_td')
                td.innerText = row[column.name]
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

        this.render_pagination(links, total)

        document.getElementById(this.datatable_id).appendChild(pagination_container)
    }

    async search(url) {
        const token = document.querySelector('meta[name="csrf-token"]').content
        let search = null
        let per_page = null
        let sort_column = this.sort_colum
        let sort_direction = this.sort_direction

        if (document.getElementById('search_field')) {
            search = document.getElementById('search_field').value
        }

        if (document.getElementById('per_page_field')) {
            per_page = document.getElementById('per_page_field').value
        }

        const req = await fetch(url, {
            method: 'post',
            headers: {
                'x-csrf-token': token,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                search: search,
                per_page: per_page,
                sort_direction: sort_direction,
                sort_column: sort_column,
            })
        })
        const res = await req.json()

        this.render(res.data, res.links, this.columns, res.total)
    }
}
