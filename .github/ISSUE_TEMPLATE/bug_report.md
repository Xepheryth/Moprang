name: Bug Report
description: Report a bug or issue
title: "[BUG] "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to report a bug! Please fill out the form below.

  - type: textarea
    id: description
    attributes:
      label: Describe the bug
      description: Clear and concise description of what the bug is
      placeholder: When I do X, Y happens instead of Z
    validations:
      required: true

  - type: textarea
    id: reproduce
    attributes:
      label: Steps to reproduce
      description: How to reproduce the bug
      placeholder: |
        1. Go to...
        2. Click on...
        3. See error...
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What should happen instead
      placeholder: The page should load without errors
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Actual behavior
      description: What actually happens
      placeholder: The page crashes with an error
    validations:
      required: true

  - type: textarea
    id: environment
    attributes:
      label: Environment
      description: OS, Browser, Node version, etc.
      placeholder: |
        - OS: Windows 11
        - Browser: Chrome 120
        - Node: 18.x
    validations:
      required: true

  - type: textarea
    id: logs
    attributes:
      label: Error logs or screenshots
      description: Paste any error messages or attach screenshots
      placeholder: |
        ```
        Error: Cannot find module...
        ```

  - type: checkboxes
    id: verification
    attributes:
      label: Verification
      options:
        - label: I searched existing issues and found no duplicates
          required: true
        - label: I provided steps to reproduce the issue
          required: true
