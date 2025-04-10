from typing import Any

import requests


class APIBase:
    """Base class for API integrations"""

    def __init__(
        self, base_url: str, headers: dict[str, Any] | None = None
    ):
        self.base_url = base_url.rstrip('/')
        self.headers = headers
        
        if self.headers and 'Content-Type' not in self.headers:
            self.headers['Content-Type'] = 'application/json'

    def execute(
        self, method: str, endpoint: str, data: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        Makes an HTTP request to the API

        Args:
            method: HTTP method (GET, POST, PUT, DELETE etc)
            endpoint: API endpoint path
            data: Dictionary containing path, query, and body parameters

        Returns:
            API response as dictionary
        """
        url = f'{self.base_url}{endpoint}'
        # Initialize params dictionary for query parameters
        params = {}
        body_data = {}

        # If data contains parameters, sort them by type
        if data:
            # Handle path parameters
            for path_param in data.get('path', []):
                url = url.replace(f'{{{path_param["name"]}}}', str(path_param['value']))

            # Handle query parameters
            for query_param in data.get('query', []):
                params[query_param['name']] = query_param['value']

            # Handle body parameters
            for body_param in data.get('body', []):
                body_data[body_param['name']] = body_param['value']

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=body_data,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            return {'error': str(e)}

    def get_available_functions(self) -> dict[str, Any]:
        """
        Returns available API functions/endpoints.
        Should be implemented by child classes.
        """
        raise NotImplementedError('Subclasses must implement get_available_functions()')
